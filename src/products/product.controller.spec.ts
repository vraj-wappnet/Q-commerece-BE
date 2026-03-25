import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './product.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UserRole } from '../common/enum/roles.enum';
import { User } from '../auth/entity/user.entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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

  const mockUser = {
    id: 1,
    email: 'seller@example.com',
    firstName: 'Test',
    lastName: 'Seller',
    password: 'password',
    mobile: '1234567890',
    role: UserRole.SELLER,
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
    it('should create a new product', async () => {
      const dto: CreateProductDto = {
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
      const mockProduct = { id: '1', name: 'Test Product' };

      mockProductsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(dto, { user: mockUser });

      expect(productService.createProduct).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockProduct);
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
        products: [{ id: '1', name: 'Test Product' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockProducts);
    });

    it('should get all products without filters', async () => {
      const query: FilterProductDto = {};
      const mockProducts = {
        products: [{ id: '1', name: 'Test Product' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockProductsService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAllProducts(query);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockProducts);
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
  });
});
