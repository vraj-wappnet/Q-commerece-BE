import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UserRole } from '../common/enum/roles.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CategoriesController', () => {
  let categoriesController: CategoriesController;
  let categoriesService: CategoriesService;

  const mockCategoriesService = {
    getAll: vi.fn(),
    getAllSubCategories: vi.fn(),
    getSubCategoriesByCategory: vi.fn(),
    createCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createSubCategory: vi.fn(),
    deleteSubCategory: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    categoriesController = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Electronics', subCategories: [] },
        { id: '2', name: 'Clothing', subCategories: [] },
      ];

      mockCategoriesService.getAll.mockResolvedValue(mockCategories);

      const result = await categoriesController.getAll();

      expect(categoriesService.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getAllSubCategories', () => {
    it('should return all subcategories', async () => {
      const mockSubCategories = [
        { id: '1', name: 'Mobile Phones', category: { id: '1', name: 'Electronics' } },
        { id: '2', name: 'Laptops', category: { id: '1', name: 'Electronics' } },
      ];

      mockCategoriesService.getAllSubCategories.mockResolvedValue(mockSubCategories);

      const result = await categoriesController.getAllSubCategories();

      expect(categoriesService.getAllSubCategories).toHaveBeenCalled();
      expect(result).toEqual(mockSubCategories);
    });
  });

  describe('getSubCategoriesByCategory', () => {
    it('should return subcategories by category', async () => {
      const categoryId = '1';
      const mockSubCategories = [
        { id: '1', name: 'Mobile Phones', category: { id: '1', name: 'Electronics' } },
      ];

      mockCategoriesService.getSubCategoriesByCategory.mockResolvedValue(mockSubCategories);

      const result = await categoriesController.getSubCategoriesByCategory(categoryId);

      expect(categoriesService.getSubCategoriesByCategory).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockSubCategories);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const dto: CreateCategoryDto = { name: 'New Category' };
      const mockCategory = { id: '3', name: 'New Category' };

      mockCategoriesService.createCategory.mockResolvedValue(mockCategory);

      const result = await categoriesController.createCategory(dto);

      expect(categoriesService.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const categoryId = '1';
      const mockResponse = { message: 'Category deleted successfully' };

      mockCategoriesService.deleteCategory.mockResolvedValue(mockResponse);

      const result = await categoriesController.deleteCategory(categoryId);

      expect(categoriesService.deleteCategory).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createSubCategory', () => {
    it('should create a new subcategory', async () => {
      const categoryId = '1';
      const dto: CreateSubCategoryDto = { name: 'New SubCategory' };
      const mockSubCategory = { id: '3', name: 'New SubCategory', category: { id: categoryId } };

      mockCategoriesService.createSubCategory.mockResolvedValue(mockSubCategory);

      const result = await categoriesController.createSubCategory(categoryId, dto);

      expect(categoriesService.createSubCategory).toHaveBeenCalledWith(categoryId, dto);
      expect(result).toEqual(mockSubCategory);
    });
  });

  describe('deleteSubCategory', () => {
    it('should delete a subcategory', async () => {
      const subCategoryId = '1';
      const mockResponse = { message: 'SubCategory deleted successfully' };

      mockCategoriesService.deleteSubCategory.mockResolvedValue(mockResponse);

      const result = await categoriesController.deleteSubCategory(subCategoryId);

      expect(categoriesService.deleteSubCategory).toHaveBeenCalledWith(subCategoryId);
      expect(result).toEqual(mockResponse);
    });
  });
});
