import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entity/category.entity';
import { SubCategory } from './entity/sub-category.entity';
import { Product } from '../products/entity/product.entity';
import { MESSAGES } from '../../common/constant/message';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: Repository<Category>;
  let subCategoryRepo: Repository<SubCategory>;
  let productRepo: Repository<Product>;

  const mockCategory = {
    id: 'category-uuid-123',
    name: 'Vegetables',
    subCategories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubCategory = {
    id: 'subcategory-uuid-123',
    name: 'Leafy Greens',
    category: mockCategory,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(SubCategory),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            count: vi.fn(),
          },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated categories with default parameters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockCategory], 1]),
      };
      vi.spyOn(categoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAll({});

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.LIST_FETCHED);
      expect(result.data.items).toEqual([mockCategory]);
      expect(result.data.total).toBe(1);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    });

    it('should apply search filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(categoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAll({ search: 'veg' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.name ILIKE :search',
        { search: '%veg%' }
      );
    });

    it('should apply name filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(categoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAll({ name: 'fruits' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.name ILIKE :name',
        { name: '%fruits%' }
      );
    });

    it('should throw BadRequestException for invalid createdFrom date', async () => {
      await expect(
        service.getAll({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid createdFrom date'));
    });

    it('should throw BadRequestException for invalid createdTo date', async () => {
      await expect(
        service.getAll({ createdTo: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid createdTo date'));
    });

    it('should throw BadRequestException for invalid updatedFrom date', async () => {
      await expect(
        service.getAll({ updatedFrom: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid updatedFrom date'));
    });

    it('should throw BadRequestException for invalid updatedTo date', async () => {
      await expect(
        service.getAll({ updatedTo: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid updatedTo date'));
    });

    it('should throw BadRequestException when createdFrom is after createdTo', async () => {
      await expect(
        service.getAll({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(new BadRequestException('createdFrom must be before or equal to createdTo'));
    });

    it('should throw BadRequestException when updatedFrom is after updatedTo', async () => {
      await expect(
        service.getAll({
          updatedFrom: '2026-12-31',
          updatedTo: '2026-01-01',
        })
      ).rejects.toThrow(new BadRequestException('updatedFrom must be before or equal to updatedTo'));
    });

    it('should handle pagination correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockCategory], 25]),
      };
      vi.spyOn(categoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAll({ page: 2, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data.totalPages).toBe(3);
      expect(result.data.hasNextPage).toBe(true);
      expect(result.data.hasPreviousPage).toBe(true);
    });

    it('should limit maximum items per page to 100', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(categoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAll({ limit: 200 });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
    });

    it('should prevent SQL injection on sortBy field', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(categoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAll({ sortBy: 'malicious; DROP TABLE categories;' as any });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('category.name', 'ASC');
    });
  });

  describe('getAllSubCategories', () => {
    it('should return paginated subcategories with default parameters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockSubCategory], 1]),
      };
      vi.spyOn(subCategoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAllSubCategories({});

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.SUBCATEGORY_LIST_FETCHED);
      expect(result.data.items).toEqual([mockSubCategory]);
    });

    it('should apply search filter for subcategory and category name', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(subCategoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllSubCategories({ search: 'leafy' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(subCategory.name ILIKE :search OR category.name ILIKE :search)',
        { search: '%leafy%' }
      );
    });

    it('should apply categoryId filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(subCategoryRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllSubCategories({ categoryId: 'category-uuid-123' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.id = :categoryId',
        { categoryId: 'category-uuid-123' }
      );
    });
  });

  describe('getSubCategoriesByCategory', () => {
    it('should throw BadRequestException when category not found', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.getSubCategoriesByCategory('non-existent-id')
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should return subcategories for valid category', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory as any);
      vi.spyOn(subCategoryRepo, 'find').mockResolvedValue([mockSubCategory] as any);

      const result = await service.getSubCategoriesByCategory('category-uuid-123');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.SUBCATEGORY_LIST_FETCHED);
      expect(result.data).toEqual([mockSubCategory]);
    });
  });

  describe('createCategory', () => {
    it('should throw BadRequestException when category already exists', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory as any);

      await expect(
        service.createCategory({ name: 'Vegetables' })
      ).rejects.toThrow(new BadRequestException('Category already exists'));
    });

    it('should create category successfully with trimmed name', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);
      vi.spyOn(categoryRepo, 'create').mockReturnValue(mockCategory as any);
      vi.spyOn(categoryRepo, 'save').mockResolvedValue(mockCategory as any);

      const result = await service.createCategory({ name: '  Vegetables  ' });

      expect(categoryRepo.create).toHaveBeenCalledWith({ name: 'Vegetables' });
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGES.CATEGORY.CREATED);
      expect(result.data).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should throw BadRequestException when category not found', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteCategory('non-existent-id')
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should throw BadRequestException when category is used by products', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory as any);
      vi.spyOn(productRepo, 'count').mockResolvedValue(5);

      await expect(
        service.deleteCategory('category-uuid-123')
      ).rejects.toThrow(new BadRequestException('Category is used by products'));
    });

    it('should delete category successfully when not used', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory as any);
      vi.spyOn(productRepo, 'count').mockResolvedValue(0);
      vi.spyOn(categoryRepo, 'delete').mockResolvedValue({} as any);

      const result = await service.deleteCategory('category-uuid-123');

      expect(categoryRepo.delete).toHaveBeenCalledWith('category-uuid-123');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.DELETED);
      expect(result.data).toBeNull();
    });
  });

  describe('createSubCategory', () => {
    it('should throw BadRequestException when category not found', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.createSubCategory('non-existent-id', { name: 'Leafy Greens' })
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should throw BadRequestException when subcategory already exists', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory as any);
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(mockSubCategory as any);

      await expect(
        service.createSubCategory('category-uuid-123', { name: 'Leafy Greens' })
      ).rejects.toThrow(new BadRequestException('SubCategory already exists'));
    });

    it('should create subcategory successfully with trimmed name', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(mockCategory as any);
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(null);
      vi.spyOn(subCategoryRepo, 'create').mockReturnValue(mockSubCategory as any);
      vi.spyOn(subCategoryRepo, 'save').mockResolvedValue(mockSubCategory as any);

      const result = await service.createSubCategory('category-uuid-123', { name: '  Leafy Greens  ' });

      expect(subCategoryRepo.create).toHaveBeenCalledWith({
        name: 'Leafy Greens',
        category: mockCategory,
      });
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGES.CATEGORY.SUBCATEGORY_CREATED);
      expect(result.data).toEqual(mockSubCategory);
    });
  });

  describe('deleteSubCategory', () => {
    it('should throw BadRequestException when subcategory not found', async () => {
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteSubCategory('non-existent-id')
      ).rejects.toThrow(new BadRequestException('SubCategory not found'));
    });

    it('should throw BadRequestException when subcategory is used by products', async () => {
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(mockSubCategory as any);
      vi.spyOn(productRepo, 'count').mockResolvedValue(3);

      await expect(
        service.deleteSubCategory('subcategory-uuid-123')
      ).rejects.toThrow(new BadRequestException('SubCategory is used by products'));
    });

    it('should delete subcategory successfully when not used', async () => {
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(mockSubCategory as any);
      vi.spyOn(productRepo, 'count').mockResolvedValue(0);
      vi.spyOn(subCategoryRepo, 'delete').mockResolvedValue({} as any);

      const result = await service.deleteSubCategory('subcategory-uuid-123');

      expect(subCategoryRepo.delete).toHaveBeenCalledWith('subcategory-uuid-123');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.SUBCATEGORY_DELETED);
      expect(result.data).toBeNull();
    });
  });

  describe('updateCategory', () => {
    it('should throw BadRequestException when category not found', async () => {
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateCategory('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should throw BadRequestException when new name already exists', async () => {
      const existingCategory = { ...mockCategory, id: 'different-id' };
      vi.spyOn(categoryRepo, 'findOne')
        .mockResolvedValueOnce(mockCategory as any)
        .mockResolvedValueOnce(existingCategory as any);

      await expect(
        service.updateCategory('category-uuid-123', { name: 'Vegetables' })
      ).rejects.toThrow(new BadRequestException('Category name already exists'));
    });

    it('should update category successfully with trimmed name', async () => {
      vi.spyOn(categoryRepo, 'findOne')
        .mockResolvedValueOnce(mockCategory as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockCategory, name: 'Fruits' } as any);
      vi.spyOn(categoryRepo, 'save').mockResolvedValue({ ...mockCategory, name: 'Fruits' } as any);

      const result = await service.updateCategory('category-uuid-123', { name: '  Fruits  ' });

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.UPDATED);
      expect(result.data.name).toBe('Fruits');
    });

    it('should allow updating to same name', async () => {
      vi.spyOn(categoryRepo, 'findOne')
        .mockResolvedValueOnce(mockCategory as any)
        .mockResolvedValueOnce(mockCategory as any)
        .mockResolvedValueOnce(mockCategory as any);
      vi.spyOn(categoryRepo, 'save').mockResolvedValue(mockCategory as any);

      const result = await service.updateCategory('category-uuid-123', { name: 'Vegetables' });

      expect(result.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('updateSubCategory', () => {
    it('should throw BadRequestException when subcategory not found', async () => {
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateSubCategory('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow(new BadRequestException('SubCategory not found'));
    });

    it('should throw BadRequestException when new name already exists in category', async () => {
      const existingSubCategory = { ...mockSubCategory, id: 'different-id' };
      vi.spyOn(subCategoryRepo, 'findOne')
        .mockResolvedValueOnce(mockSubCategory as any)
        .mockResolvedValueOnce(existingSubCategory as any);

      await expect(
        service.updateSubCategory('subcategory-uuid-123', { name: 'Leafy Greens' })
      ).rejects.toThrow(new BadRequestException('SubCategory name already exists in this category'));
    });

    it('should throw BadRequestException when new category not found', async () => {
      vi.spyOn(subCategoryRepo, 'findOne').mockResolvedValue(mockSubCategory as any);
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateSubCategory('subcategory-uuid-123', { categoryId: 'non-existent-id' })
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should update subcategory name successfully', async () => {
      vi.spyOn(subCategoryRepo, 'findOne')
        .mockResolvedValueOnce(mockSubCategory as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockSubCategory, name: 'Root Vegetables' } as any);
      vi.spyOn(subCategoryRepo, 'save').mockResolvedValue({ ...mockSubCategory, name: 'Root Vegetables' } as any);

      const result = await service.updateSubCategory('subcategory-uuid-123', { name: '  Root Vegetables  ' });

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.SUBCATEGORY_UPDATED);
    });

    it('should update subcategory category successfully', async () => {
      const newCategory = { ...mockCategory, id: 'new-category-id', name: 'Fruits' };
      vi.spyOn(subCategoryRepo, 'findOne')
        .mockResolvedValueOnce(mockSubCategory as any)
        .mockResolvedValueOnce(mockSubCategory as any);
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(newCategory as any);
      vi.spyOn(subCategoryRepo, 'save').mockResolvedValue({ ...mockSubCategory, category: newCategory } as any);

      const result = await service.updateSubCategory('subcategory-uuid-123', { categoryId: 'new-category-id' });

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CATEGORY.SUBCATEGORY_UPDATED);
    });

    it('should update both name and category successfully', async () => {
      const newCategory = { ...mockCategory, id: 'new-category-id', name: 'Fruits' };
      vi.spyOn(subCategoryRepo, 'findOne')
        .mockResolvedValueOnce(mockSubCategory as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockSubCategory, name: 'Citrus', category: newCategory } as any);
      vi.spyOn(categoryRepo, 'findOne').mockResolvedValue(newCategory as any);
      vi.spyOn(subCategoryRepo, 'save').mockResolvedValue({ ...mockSubCategory, name: 'Citrus', category: newCategory } as any);

      const result = await service.updateSubCategory('subcategory-uuid-123', {
        name: 'Citrus',
        categoryId: 'new-category-id',
      });

      expect(result.statusCode).toBe(HttpStatus.OK);
    });
  });
});
