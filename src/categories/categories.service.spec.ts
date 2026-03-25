import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Category } from './entity/category.entity';
import { SubCategory } from './entity/sub-category.entity';
import { Product } from '../products/entity/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: Repository<Category>;
  let subCategoryRepo: Repository<SubCategory>;
  let productRepo: Repository<Product>;

  const mockCategoryRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockSubCategoryRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockProductRepo = {
    count: vi.fn(),
  };

  const mockCategory: Category = {
    id: '1',
    name: 'Electronics',
    subCategories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Category;

  const mockSubCategory: SubCategory = {
    id: '1',
    name: 'Mobile Phones',
    category: mockCategory,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SubCategory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
        {
          provide: getRepositoryToken(SubCategory),
          useValue: mockSubCategoryRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepo = module.get<Repository<Category>>(getRepositoryToken(Category));
    subCategoryRepo = module.get<Repository<SubCategory>>(getRepositoryToken(SubCategory));
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all categories ordered by name', async () => {
      const mockCategories = [mockCategory];
      mockCategoryRepo.find.mockResolvedValue(mockCategories);

      const result = await service.getAll();

      expect(categoryRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
        relations: ['subCategories'],
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getAllSubCategories', () => {
    it('should return all subcategories ordered by name', async () => {
      const mockSubCategories = [mockSubCategory];
      mockSubCategoryRepo.find.mockResolvedValue(mockSubCategories);

      const result = await service.getAllSubCategories();

      expect(subCategoryRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
        relations: ['category'],
      });
      expect(result).toEqual(mockSubCategories);
    });
  });

  describe('getSubCategoriesByCategory', () => {
    it('should return subcategories by category', async () => {
      const categoryId = '1';
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.find.mockResolvedValue([mockSubCategory]);

      const result = await service.getSubCategoriesByCategory(categoryId);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(subCategoryRepo.find).toHaveBeenCalledWith({
        where: { category: { id: categoryId } },
        order: { name: 'ASC' },
        relations: ['category'],
      });
      expect(result).toEqual([mockSubCategory]);
    });

    it('should throw error if category not found', async () => {
      const categoryId = '999';
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.getSubCategoriesByCategory(categoryId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const dto: CreateCategoryDto = { name: 'New Category' };
      const trimmedName = 'New Category';
      const newCategory = { id: '2', name: trimmedName };

      mockCategoryRepo.findOne.mockResolvedValue(null);
      mockCategoryRepo.create.mockReturnValue(newCategory);
      mockCategoryRepo.save.mockResolvedValue(newCategory);

      const result = await service.createCategory(dto);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { name: trimmedName } });
      expect(categoryRepo.create).toHaveBeenCalledWith({ name: trimmedName });
      expect(categoryRepo.save).toHaveBeenCalledWith(newCategory);
      expect(result).toEqual(newCategory);
    });

    it('should throw error if category already exists', async () => {
      const dto: CreateCategoryDto = { name: 'Electronics' };
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);

      await expect(service.createCategory(dto)).rejects.toThrow(
        'Category already exists'
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const categoryId = '1';
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockProductRepo.count.mockResolvedValue(0);
      mockCategoryRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteCategory(categoryId);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: categoryId } });
      expect(productRepo.count).toHaveBeenCalledWith({ where: { category: { id: categoryId } } });
      expect(categoryRepo.delete).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it('should throw error if category not found', async () => {
      const categoryId = '999';
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteCategory(categoryId)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should throw error if category is used by products', async () => {
      const categoryId = '1';
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockProductRepo.count.mockResolvedValue(5);

      await expect(service.deleteCategory(categoryId)).rejects.toThrow(
        'Category is used by products'
      );
    });
  });

  describe('createSubCategory', () => {
    it('should create a new subcategory', async () => {
      const categoryId = '1';
      const dto: CreateSubCategoryDto = { name: 'New SubCategory' };
      const trimmedName = 'New SubCategory';
      const newSubCategory = { id: '2', name: trimmedName, category: mockCategory };

      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(null);
      mockSubCategoryRepo.create.mockReturnValue(newSubCategory);
      mockSubCategoryRepo.save.mockResolvedValue(newSubCategory);

      const result = await service.createSubCategory(categoryId, dto);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(subCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { category: { id: categoryId }, name: trimmedName },
        relations: ['category'],
      });
      expect(subCategoryRepo.create).toHaveBeenCalledWith({ name: trimmedName, category: mockCategory });
      expect(result).toEqual(newSubCategory);
    });

    it('should throw error if category not found', async () => {
      const categoryId = '999';
      const dto: CreateSubCategoryDto = { name: 'New SubCategory' };
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.createSubCategory(categoryId, dto)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should throw error if subcategory already exists', async () => {
      const categoryId = '1';
      const dto: CreateSubCategoryDto = { name: 'Mobile Phones' };
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);

      await expect(service.createSubCategory(categoryId, dto)).rejects.toThrow(
        'SubCategory already exists'
      );
    });
  });

  describe('deleteSubCategory', () => {
    it('should delete a subcategory', async () => {
      const subCategoryId = '1';
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.count.mockResolvedValue(0);
      mockSubCategoryRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteSubCategory(subCategoryId);

      expect(subCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: subCategoryId },
        relations: ['category'],
      });
      expect(productRepo.count).toHaveBeenCalledWith({
        where: { subCategory: { id: subCategoryId } },
      });
      expect(subCategoryRepo.delete).toHaveBeenCalledWith(subCategoryId);
      expect(result).toEqual({ message: 'SubCategory deleted successfully' });
    });

    it('should throw error if subcategory not found', async () => {
      const subCategoryId = '999';
      mockSubCategoryRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteSubCategory(subCategoryId)).rejects.toThrow(
        'SubCategory not found'
      );
    });

    it('should throw error if subcategory is used by products', async () => {
      const subCategoryId = '1';
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.count.mockResolvedValue(3);

      await expect(service.deleteSubCategory(subCategoryId)).rejects.toThrow(
        'SubCategory is used by products'
      );
    });
  });
});
