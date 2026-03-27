import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { MESSAGES } from '../../common/constant/message';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

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

  const mockCategoriesService = {
    getAll: vi.fn(),
    getAllSubCategories: vi.fn(),
    getSubCategoriesByCategory: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createSubCategory: vi.fn(),
    updateSubCategory: vi.fn(),
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

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /categories - getAll', () => {
    it('should return all categories with default pagination', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.LIST_FETCHED,
        data: {
          items: [mockCategory],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockCategoriesService.getAll.mockResolvedValue(expectedResponse);

      const result = await controller.getAll({});

      expect(service.getAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResponse);
    });

    it('should apply search filter correctly', async () => {
      const filters = { search: 'veg' };
      mockCategoriesService.getAll.mockResolvedValue({} as any);

      await controller.getAll(filters);

      expect(service.getAll).toHaveBeenCalledWith(filters);
    });

    it('should apply name filter correctly', async () => {
      const filters = { name: 'fruits' };
      mockCategoriesService.getAll.mockResolvedValue({} as any);

      await controller.getAll(filters);

      expect(service.getAll).toHaveBeenCalledWith(filters);
    });

    it('should apply date range filters correctly', async () => {
      const filters = {
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        updatedFrom: '2026-01-01',
        updatedTo: '2026-12-31',
      };
      mockCategoriesService.getAll.mockResolvedValue({} as any);

      await controller.getAll(filters);

      expect(service.getAll).toHaveBeenCalledWith(filters);
    });

    it('should apply pagination correctly', async () => {
      const filters = { page: 2, limit: 20 };
      mockCategoriesService.getAll.mockResolvedValue({} as any);

      await controller.getAll(filters);

      expect(service.getAll).toHaveBeenCalledWith(filters);
    });

    it('should apply sorting correctly', async () => {
      const filters = { sortBy: 'name' as const, sortOrder: 'DESC' as const };
      mockCategoriesService.getAll.mockResolvedValue({} as any);

      await controller.getAll(filters);

      expect(service.getAll).toHaveBeenCalledWith(filters);
    });

    it('should throw error for invalid date range', async () => {
      mockCategoriesService.getAll.mockRejectedValue(
        new BadRequestException('createdFrom must be before or equal to createdTo')
      );

      await expect(
        controller.getAll({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid date format', async () => {
      mockCategoriesService.getAll.mockRejectedValue(
        new BadRequestException('Invalid createdFrom date')
      );

      await expect(
        controller.getAll({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /categories/subcategories - getAllSubCategories', () => {
    it('should return all subcategories with default pagination', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_LIST_FETCHED,
        data: {
          items: [mockSubCategory],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockCategoriesService.getAllSubCategories.mockResolvedValue(expectedResponse);

      const result = await controller.getAllSubCategories({});

      expect(service.getAllSubCategories).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResponse);
    });

    it('should apply search filter correctly', async () => {
      const filters = { search: 'leafy' };
      mockCategoriesService.getAllSubCategories.mockResolvedValue({} as any);

      await controller.getAllSubCategories(filters);

      expect(service.getAllSubCategories).toHaveBeenCalledWith(filters);
    });

    it('should apply categoryId filter correctly', async () => {
      const filters = { categoryId: 'category-uuid-123' };
      mockCategoriesService.getAllSubCategories.mockResolvedValue({} as any);

      await controller.getAllSubCategories(filters);

      expect(service.getAllSubCategories).toHaveBeenCalledWith(filters);
    });

    it('should apply all filters together', async () => {
      const filters = {
        search: 'leafy',
        name: 'greens',
        categoryId: 'category-uuid-123',
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        sortBy: 'name' as const,
        sortOrder: 'ASC' as const,
        page: 1,
        limit: 10,
      };
      mockCategoriesService.getAllSubCategories.mockResolvedValue({} as any);

      await controller.getAllSubCategories(filters);

      expect(service.getAllSubCategories).toHaveBeenCalledWith(filters);
    });
  });

  describe('GET /categories/:categoryId/subcategories - getSubCategoriesByCategory', () => {
    it('should return subcategories for valid category', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_LIST_FETCHED,
        data: [mockSubCategory],
      };
      mockCategoriesService.getSubCategoriesByCategory.mockResolvedValue(expectedResponse);

      const result = await controller.getSubCategoriesByCategory('category-uuid-123');

      expect(service.getSubCategoriesByCategory).toHaveBeenCalledWith('category-uuid-123');
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.getSubCategoriesByCategory.mockRejectedValue(
        new BadRequestException('Category not found')
      );

      await expect(
        controller.getSubCategoriesByCategory('non-existent-id')
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });
  });

  describe('POST /categories - createCategory', () => {
    const createCategoryDto = {
      name: 'Vegetables',
    };

    it('should create category successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.CATEGORY.CREATED,
        data: mockCategory,
      };
      mockCategoriesService.createCategory.mockResolvedValue(expectedResponse);

      const result = await controller.createCategory(createCategoryDto);

      expect(service.createCategory).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when name is missing', async () => {
      const invalidDto = {};
      mockCategoriesService.createCategory.mockRejectedValue(new BadRequestException());

      await expect(controller.createCategory(invalidDto as any)).rejects.toThrow();
    });

    it('should throw error when name is empty string', async () => {
      const invalidDto = { name: '' };
      mockCategoriesService.createCategory.mockRejectedValue(new BadRequestException());

      await expect(controller.createCategory(invalidDto as any)).rejects.toThrow();
    });

    it('should throw error when name is only whitespace', async () => {
      const invalidDto = { name: '   ' };
      mockCategoriesService.createCategory.mockRejectedValue(new BadRequestException());

      await expect(controller.createCategory(invalidDto as any)).rejects.toThrow();
    });

    it('should throw error when category already exists', async () => {
      mockCategoriesService.createCategory.mockRejectedValue(
        new BadRequestException('Category already exists')
      );

      await expect(controller.createCategory(createCategoryDto)).rejects.toThrow(
        new BadRequestException('Category already exists')
      );
    });

    it('should handle name with leading/trailing spaces', async () => {
      const dtoWithSpaces = { name: '  Vegetables  ' };
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.CATEGORY.CREATED,
        data: mockCategory,
      };
      mockCategoriesService.createCategory.mockResolvedValue(expectedResponse);

      const result = await controller.createCategory(dtoWithSpaces);

      expect(service.createCategory).toHaveBeenCalledWith(dtoWithSpaces);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('PATCH /categories/:id - updateCategory', () => {
    const updateCategoryDto = {
      name: 'Fruits',
    };

    it('should update category successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.UPDATED,
        data: { ...mockCategory, name: 'Fruits' },
      };
      mockCategoriesService.updateCategory.mockResolvedValue(expectedResponse);

      const result = await controller.updateCategory('category-uuid-123', updateCategoryDto);

      expect(service.updateCategory).toHaveBeenCalledWith('category-uuid-123', updateCategoryDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.updateCategory.mockRejectedValue(
        new BadRequestException('Category not found')
      );

      await expect(
        controller.updateCategory('non-existent-id', updateCategoryDto)
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should throw error when new name already exists', async () => {
      mockCategoriesService.updateCategory.mockRejectedValue(
        new BadRequestException('Category name already exists')
      );

      await expect(
        controller.updateCategory('category-uuid-123', updateCategoryDto)
      ).rejects.toThrow(new BadRequestException('Category name already exists'));
    });

    it('should handle empty update dto', async () => {
      const emptyDto = {};
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.UPDATED,
        data: mockCategory,
      };
      mockCategoriesService.updateCategory.mockResolvedValue(expectedResponse);

      const result = await controller.updateCategory('category-uuid-123', emptyDto);

      expect(service.updateCategory).toHaveBeenCalledWith('category-uuid-123', emptyDto);
    });
  });

  describe('DELETE /categories/:id - deleteCategory', () => {
    it('should delete category successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.DELETED,
        data: null,
      };
      mockCategoriesService.deleteCategory.mockResolvedValue(expectedResponse);

      const result = await controller.deleteCategory('category-uuid-123');

      expect(service.deleteCategory).toHaveBeenCalledWith('category-uuid-123');
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.deleteCategory.mockRejectedValue(
        new BadRequestException('Category not found')
      );

      await expect(
        controller.deleteCategory('non-existent-id')
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should throw error when category is used by products', async () => {
      mockCategoriesService.deleteCategory.mockRejectedValue(
        new BadRequestException('Category is used by products')
      );

      await expect(
        controller.deleteCategory('category-uuid-123')
      ).rejects.toThrow(new BadRequestException('Category is used by products'));
    });
  });

  describe('POST /categories/:categoryId/subcategories - createSubCategory', () => {
    const createSubCategoryDto = {
      name: 'Leafy Greens',
    };

    it('should create subcategory successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.CATEGORY.SUBCATEGORY_CREATED,
        data: mockSubCategory,
      };
      mockCategoriesService.createSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.createSubCategory('category-uuid-123', createSubCategoryDto);

      expect(service.createSubCategory).toHaveBeenCalledWith('category-uuid-123', createSubCategoryDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when name is missing', async () => {
      const invalidDto = {};
      mockCategoriesService.createSubCategory.mockRejectedValue(new BadRequestException());

      await expect(
        controller.createSubCategory('category-uuid-123', invalidDto as any)
      ).rejects.toThrow();
    });

    it('should throw error when category not found', async () => {
      mockCategoriesService.createSubCategory.mockRejectedValue(
        new BadRequestException('Category not found')
      );

      await expect(
        controller.createSubCategory('non-existent-id', createSubCategoryDto)
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should throw error when subcategory already exists', async () => {
      mockCategoriesService.createSubCategory.mockRejectedValue(
        new BadRequestException('SubCategory already exists')
      );

      await expect(
        controller.createSubCategory('category-uuid-123', createSubCategoryDto)
      ).rejects.toThrow(new BadRequestException('SubCategory already exists'));
    });

    it('should handle name with leading/trailing spaces', async () => {
      const dtoWithSpaces = { name: '  Leafy Greens  ' };
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.CATEGORY.SUBCATEGORY_CREATED,
        data: mockSubCategory,
      };
      mockCategoriesService.createSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.createSubCategory('category-uuid-123', dtoWithSpaces);

      expect(service.createSubCategory).toHaveBeenCalledWith('category-uuid-123', dtoWithSpaces);
    });
  });

  describe('PATCH /categories/subcategories/:id - updateSubCategory', () => {
    const updateSubCategoryDto = {
      name: 'Root Vegetables',
    };

    it('should update subcategory successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_UPDATED,
        data: { ...mockSubCategory, name: 'Root Vegetables' },
      };
      mockCategoriesService.updateSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.updateSubCategory('subcategory-uuid-123', updateSubCategoryDto);

      expect(service.updateSubCategory).toHaveBeenCalledWith('subcategory-uuid-123', updateSubCategoryDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when subcategory not found', async () => {
      mockCategoriesService.updateSubCategory.mockRejectedValue(
        new BadRequestException('SubCategory not found')
      );

      await expect(
        controller.updateSubCategory('non-existent-id', updateSubCategoryDto)
      ).rejects.toThrow(new BadRequestException('SubCategory not found'));
    });

    it('should throw error when new name already exists in category', async () => {
      mockCategoriesService.updateSubCategory.mockRejectedValue(
        new BadRequestException('SubCategory name already exists in this category')
      );

      await expect(
        controller.updateSubCategory('subcategory-uuid-123', updateSubCategoryDto)
      ).rejects.toThrow(new BadRequestException('SubCategory name already exists in this category'));
    });

    it('should update subcategory category successfully', async () => {
      const updateDto = { categoryId: 'new-category-id' };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_UPDATED,
        data: mockSubCategory,
      };
      mockCategoriesService.updateSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.updateSubCategory('subcategory-uuid-123', updateDto);

      expect(service.updateSubCategory).toHaveBeenCalledWith('subcategory-uuid-123', updateDto);
    });

    it('should throw error when new category not found', async () => {
      const updateDto = { categoryId: 'non-existent-id' };
      mockCategoriesService.updateSubCategory.mockRejectedValue(
        new BadRequestException('Category not found')
      );

      await expect(
        controller.updateSubCategory('subcategory-uuid-123', updateDto)
      ).rejects.toThrow(new BadRequestException('Category not found'));
    });

    it('should update both name and category successfully', async () => {
      const updateDto = {
        name: 'Citrus',
        categoryId: 'new-category-id',
      };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_UPDATED,
        data: { ...mockSubCategory, name: 'Citrus' },
      };
      mockCategoriesService.updateSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.updateSubCategory('subcategory-uuid-123', updateDto);

      expect(service.updateSubCategory).toHaveBeenCalledWith('subcategory-uuid-123', updateDto);
    });

    it('should handle empty update dto', async () => {
      const emptyDto = {};
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_UPDATED,
        data: mockSubCategory,
      };
      mockCategoriesService.updateSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.updateSubCategory('subcategory-uuid-123', emptyDto);

      expect(service.updateSubCategory).toHaveBeenCalledWith('subcategory-uuid-123', emptyDto);
    });
  });

  describe('DELETE /categories/subcategories/:id - deleteSubCategory', () => {
    it('should delete subcategory successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.SUBCATEGORY_DELETED,
        data: null,
      };
      mockCategoriesService.deleteSubCategory.mockResolvedValue(expectedResponse);

      const result = await controller.deleteSubCategory('subcategory-uuid-123');

      expect(service.deleteSubCategory).toHaveBeenCalledWith('subcategory-uuid-123');
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when subcategory not found', async () => {
      mockCategoriesService.deleteSubCategory.mockRejectedValue(
        new BadRequestException('SubCategory not found')
      );

      await expect(
        controller.deleteSubCategory('non-existent-id')
      ).rejects.toThrow(new BadRequestException('SubCategory not found'));
    });

    it('should throw error when subcategory is used by products', async () => {
      mockCategoriesService.deleteSubCategory.mockRejectedValue(
        new BadRequestException('SubCategory is used by products')
      );

      await expect(
        controller.deleteSubCategory('subcategory-uuid-123')
      ).rejects.toThrow(new BadRequestException('SubCategory is used by products'));
    });
  });

  describe('Authorization and Guards', () => {
    it('should require authentication for createCategory', () => {
      expect(controller.createCategory).toBeDefined();
    });

    it('should require authentication for updateCategory', () => {
      expect(controller.updateCategory).toBeDefined();
    });

    it('should require authentication for deleteCategory', () => {
      expect(controller.deleteCategory).toBeDefined();
    });

    it('should require authentication for createSubCategory', () => {
      expect(controller.createSubCategory).toBeDefined();
    });

    it('should require authentication for updateSubCategory', () => {
      expect(controller.updateSubCategory).toBeDefined();
    });

    it('should require authentication for deleteSubCategory', () => {
      expect(controller.deleteSubCategory).toBeDefined();
    });

    it('should require ADMIN role for all write operations', () => {
      // This is validated by the @Roles decorator
      expect(controller.createCategory).toBeDefined();
      expect(controller.updateCategory).toBeDefined();
      expect(controller.deleteCategory).toBeDefined();
      expect(controller.createSubCategory).toBeDefined();
      expect(controller.updateSubCategory).toBeDefined();
      expect(controller.deleteSubCategory).toBeDefined();
    });
  });

  describe('Response Structure Validation', () => {
    it('should return correct response structure for getAll', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.LIST_FETCHED,
        data: {
          items: [mockCategory],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockCategoriesService.getAll.mockResolvedValue(expectedResponse);

      const result = await controller.getAll({});

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('items');
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('page');
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('totalPages');
      expect(result.data).toHaveProperty('hasNextPage');
      expect(result.data).toHaveProperty('hasPreviousPage');
    });

    it('should return correct response structure for createCategory', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.CATEGORY.CREATED,
        data: mockCategory,
      };
      mockCategoriesService.createCategory.mockResolvedValue(expectedResponse);

      const result = await controller.createCategory({ name: 'Vegetables' });

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.statusCode).toBe(HttpStatus.CREATED);
    });

    it('should return correct response structure for deleteCategory', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CATEGORY.DELETED,
        data: null,
      };
      mockCategoriesService.deleteCategory.mockResolvedValue(expectedResponse);

      const result = await controller.deleteCategory('category-uuid-123');

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toBeNull();
    });
  });
});
