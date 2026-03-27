import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './product.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { User } from '../auth/entity/user.entity';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productService: ProductsService;

  const mockProductsService = {
    createProduct: vi.fn(),
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  };

  const mockUser: User = {
    id: '1',
    email: 'seller@example.com',
    firstName: 'Test',
    lastName: 'Seller',
    password: 'password',
    mobile: '1234567890',
    role: { name: 'SELLER' } as any,
    isActive: true,
    isVerified: true,
    adminApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    const validDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      mrp: 100,
      sellingPrice: 90,
      stockQuantity: 10,
      shopId: '550e8400-e29b-41d4-a716-446655440000',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      subCategoryId: '550e8400-e29b-41d4-a716-446655440000',
      imageUrls: ['image1.jpg'],
      discountPercentage: 10,
      isAvailable: true,
      isVeg: true,
      unit: 'kg',
    };

    it('should create a new product', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };

      mockProductsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(validDto, { user: mockUser });

      expect(productService.createProduct).toHaveBeenCalledWith(validDto, mockUser);
      expect(result).toEqual(mockProduct);
    });

    it('should handle service errors', async () => {
      mockProductsService.createProduct.mockRejectedValue(new Error('Shop not found'));

      await expect(controller.createProduct(validDto, { user: mockUser })).rejects.toThrow('Shop not found');
    });

    it('should create product with all required fields', async () => {
      const mockProduct = { id: '1', ...validDto };

      mockProductsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(validDto, { user: mockUser });

      expect(result).toEqual(mockProduct);
    });

    it('should create product without optional fields', async () => {
      const minimalDto: CreateProductDto = {
        name: 'Test Product',
        mrp: 100,
        sellingPrice: 90,
        stockQuantity: 10,
        shopId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        imageUrls: ['image1.jpg'],
        isAvailable: true,
        isVeg: true,
        unit: 'kg',
      };

      const mockProduct = { id: '1', ...minimalDto };

      mockProductsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(minimalDto, { user: mockUser });

      expect(result).toEqual(mockProduct);
    });

    it('should handle different product types', async () => {
      const vegProduct = { ...validDto, isVeg: true };
      const nonVegProduct = { ...validDto, isVeg: false };

      mockProductsService.createProduct.mockResolvedValue({ id: '1' });

      await controller.createProduct(vegProduct, { user: mockUser });
      expect(productService.createProduct).toHaveBeenCalledWith(vegProduct, mockUser);

      await controller.createProduct(nonVegProduct, { user: mockUser });
      expect(productService.createProduct).toHaveBeenCalledWith(nonVegProduct, mockUser);
    });
  });

  describe('getAllProducts', () => {
    it('should get all products with filters', async () => {
      const query: FilterProductDto = {
        categoryId: '1',
        search: 'test',
        page: 1,
        limit: 10,
      };
      const mockProducts = {
        data: [{ id: '1', name: 'Test Product' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockProducts);
    });

    it('should get all products without filters', async () => {
      const query: FilterProductDto = {};
      const mockProducts = {
        data: [{ id: '1', name: 'Test Product' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockProducts);
    });

    it('should filter by search term', async () => {
      const query: FilterProductDto = { search: 'mobile' };
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
    });

    it('should filter by shopId', async () => {
      const query: FilterProductDto = { shopId: '1' };
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
    });

    it('should filter by categoryId', async () => {
      const query: FilterProductDto = { categoryId: '1' };
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
    });

    it('should filter by subCategoryId', async () => {
      const query: FilterProductDto = { subCategoryId: '1' };
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
    });

    it('should handle pagination parameters', async () => {
      const query: FilterProductDto = { page: 2, limit: 20 };
      const mockProducts = {
        data: [],
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAllProducts(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should handle sorting parameters', async () => {
      const query: FilterProductDto = { sortBy: 'name', sortOrder: 'ASC' };
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
    });

    it('should handle combined filters', async () => {
      const query: FilterProductDto = {
        search: 'test',
        shopId: '1',
        categoryId: '1',
        subCategoryId: '1',
        sortBy: 'name',
        sortOrder: 'ASC',
        page: 1,
        limit: 10,
      };
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
    });

    it('should handle empty results', async () => {
      const query: FilterProductDto = {};
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAllProducts(query);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle service errors', async () => {
      const query: FilterProductDto = {};

      mockProductsService.getAllProducts.mockRejectedValue(new Error('Database error'));

      await expect(controller.getAllProducts(query)).rejects.toThrow('Database error');
    });
  });

  describe('getProductById', () => {
    it('should get product by id', async () => {
      const productId = '1';
      const mockProduct = { id: '1', name: 'Test Product' };

      mockProductsService.getProductById.mockResolvedValue(mockProduct);

      const result = await controller.getProductById(productId);

      expect(productService.getProductById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('should handle service errors', async () => {
      const productId = '999';

      mockProductsService.getProductById.mockRejectedValue(new Error('Product not found'));

      await expect(controller.getProductById(productId)).rejects.toThrow('Product not found');
    });

    it('should handle different product IDs', async () => {
      const productIds = ['1', '2', '3'];

      for (const id of productIds) {
        const mockProduct = { id, name: `Product ${id}` };
        mockProductsService.getProductById.mockResolvedValue(mockProduct);

        const result = await controller.getProductById(id);

        expect(result.id).toBe(id);
      }
    });

    it('should return product with all relations', async () => {
      const productId = '1';
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        shop: { id: '1', name: 'Test Shop' },
        category: { id: '1', name: 'Electronics' },
        subCategory: { id: '1', name: 'Mobile' },
      };

      mockProductsService.getProductById.mockResolvedValue(mockProduct);

      const result = await controller.getProductById(productId);

      expect(result).toHaveProperty('shop');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('subCategory');
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const productId = '1';
      const dto: UpdateProductDto = {
        name: 'Updated Product',
        mrp: 150,
        sellingPrice: 140,
      };
      const mockProduct = { id: '1', name: 'Updated Product' };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(productService.updateProduct).toHaveBeenCalledWith(productId, dto, mockUser);
      expect(result).toEqual(mockProduct);
    });

    it('should handle service errors', async () => {
      const productId = '999';
      const dto: UpdateProductDto = { name: 'Updated Product' };

      mockProductsService.updateProduct.mockRejectedValue(new Error('Product not found'));

      await expect(controller.updateProduct(productId, dto, { user: mockUser })).rejects.toThrow('Product not found');
    });

    it('should update single field', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { name: 'Updated Name' };
      const mockProduct = { id: '1', name: 'Updated Name' };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result.name).toBe('Updated Name');
    });

    it('should update multiple fields', async () => {
      const productId = '1';
      const dto: UpdateProductDto = {
        name: 'Updated Product',
        mrp: 150,
        sellingPrice: 140,
        stockQuantity: 20,
      };
      const mockProduct = { id: '1', ...dto };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result).toEqual(mockProduct);
    });

    it('should update pricing fields', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { mrp: 200, sellingPrice: 180 };
      const mockProduct = { id: '1', mrp: 200, sellingPrice: 180 };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result.mrp).toBe(200);
      expect(result.sellingPrice).toBe(180);
    });

    it('should update inventory fields', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { stockQuantity: 50, isAvailable: false };
      const mockProduct = { id: '1', stockQuantity: 50, isAvailable: false };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result.stockQuantity).toBe(50);
      expect(result.isAvailable).toBe(false);
    });

    it('should update images', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { imageUrls: ['new1.jpg', 'new2.jpg'] };
      const mockProduct = { id: '1', images: ['new1.jpg', 'new2.jpg'] };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result.images).toEqual(['new1.jpg', 'new2.jpg']);
    });

    it('should update shop', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { shopId: '2' };
      const mockProduct = { id: '1', shop: { id: '2' } };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result).toHaveProperty('shop');
      expect(result.shop).toBeDefined();
      expect((result as any).shop.id).toBe('2');
    });

    it('should update category', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { categoryId: '2' };
      const mockProduct = { id: '1', category: { id: '2' } };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result).toHaveProperty('category');
      expect(result.category).toBeDefined();
      expect((result as any).category.id).toBe('2');
    });

    it('should update subCategory', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { subCategoryId: '2' };
      const mockProduct = { id: '1', subCategory: { id: '2' } };

      mockProductsService.updateProduct.mockResolvedValue(mockProduct);

      const result = await controller.updateProduct(productId, dto, { user: mockUser });

      expect(result).toHaveProperty('subCategory');
      expect(result.subCategory).toBeDefined();
      expect((result as any).subCategory.id).toBe('2');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      const productId = '1';
      const mockResult = { message: 'Product deleted successfully' };

      mockProductsService.deleteProduct.mockResolvedValue(mockResult);

      const result = await controller.deleteProduct(productId, { user: mockUser });

      expect(productService.deleteProduct).toHaveBeenCalledWith(productId, mockUser);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const productId = '999';

      mockProductsService.deleteProduct.mockRejectedValue(new Error('Product not found'));

      await expect(controller.deleteProduct(productId, { user: mockUser })).rejects.toThrow('Product not found');
    });

    it('should handle unauthorized deletion', async () => {
      const productId = '1';

      mockProductsService.deleteProduct.mockRejectedValue(new Error('Unauthorized to delete this product'));

      await expect(controller.deleteProduct(productId, { user: mockUser })).rejects.toThrow('Unauthorized to delete this product');
    });

    it('should handle different product IDs', async () => {
      const productIds = ['1', '2', '3'];

      for (const id of productIds) {
        const mockResult = { message: 'Product deleted successfully' };
        mockProductsService.deleteProduct.mockResolvedValue(mockResult);

        const result = await controller.deleteProduct(id, { user: mockUser });

        expect(result).toEqual(mockResult);
      }
    });

    it('should handle database errors', async () => {
      const productId = '1';

      mockProductsService.deleteProduct.mockRejectedValue(new Error('Database error'));

      await expect(controller.deleteProduct(productId, { user: mockUser })).rejects.toThrow('Database error');
    });
  });
});
