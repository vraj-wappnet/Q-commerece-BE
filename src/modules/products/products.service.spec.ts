import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './entity/product.entity';
import { Shop } from '../modules/shops/entity/shop.entity';
import { Category } from '../categories/entity/category.entity';
import { SubCategory } from '../categories/entity/sub-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { User } from '../auth/entity/user.entity';
import { UserRole } from 'src/common/enum/roles.enum';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: Repository<Product>;
  let shopRepo: Repository<Shop>;
  let categoryRepo: Repository<Category>;
  let subCategoryRepo: Repository<SubCategory>;

  const mockProductRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    createQueryBuilder: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    merge: vi.fn(),
  };

  const mockShopRepo = {
    findOne: vi.fn(),
  };

  const mockCategoryRepo = {
    findOne: vi.fn(),
  };

  const mockSubCategoryRepo = {
    findOne: vi.fn(),
  };

  const mockUser: User = {
    id: '1',
    email: 'seller@example.com',
    role: UserRole.SELLER,
  } as any;

  const mockShop: Shop = {
    id: '1',
    name: 'Test Shop',
    seller: { id: '1' },
  } as any;

  const mockCategory: Category = {
    id: '1',
    name: 'Electronics',
  } as any;

  const mockSubCategory: SubCategory = {
    id: '1',
    name: 'Mobile Phones',
    category: { id: '1' },
  } as any;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    mrp: 100,
    sellingPrice: 90,
    stockQuantity: 10,
    isAvailable: true,
    isVeg: true,
    unit: 'kg',
    images: ['image1.jpg'],
    shop: mockShop,
    category: mockCategory,
    subCategory: mockSubCategory,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
        {
          provide: getRepositoryToken(Shop),
          useValue: mockShopRepo,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
        {
          provide: getRepositoryToken(SubCategory),
          useValue: mockSubCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    shopRepo = module.get<Repository<Shop>>(getRepositoryToken(Shop));
    categoryRepo = module.get<Repository<Category>>(getRepositoryToken(Category));
    subCategoryRepo = module.get<Repository<SubCategory>>(getRepositoryToken(SubCategory));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        mrp: 100,
        sellingPrice: 90,
        stockQuantity: 10,
        shopId: '1',
        categoryId: '1',
        subCategoryId: '1',
        imageUrls: ['image1.jpg'],
        isAvailable: true,
        isVeg: true,
        unit: 'kg',
      };

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(dto, mockUser);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['seller'],
      });
      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(subCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category'],
      });
      expect(productRepo.create).toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if shop not found', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        mrp: 100,
        sellingPrice: 90,
        stockQuantity: 10,
        shopId: '999',
        categoryId: '1',
        imageUrls: ['image1.jpg'],
        isAvailable: true,
        isVeg: true,
        unit: 'kg',
      };

      mockShopRepo.findOne.mockResolvedValue(null);

      await expect(service.createProduct(dto, mockUser))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw error if user not authorized for shop', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        mrp: 100,
        sellingPrice: 90,
        stockQuantity: 10,
        shopId: '1',
        categoryId: '1',
        imageUrls: ['image1.jpg'],
        isAvailable: true,
        isVeg: true,
        unit: 'kg',
      };

      const unauthorizedUser = { ...mockUser, id: '999' };
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      await expect(service.createProduct(dto, unauthorizedUser))
        .rejects.toThrow('You are not authorized to add product to this shop');
    });

    it('should allow admin to create product for any shop', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        mrp: 100,
        sellingPrice: 90,
        stockQuantity: 10,
        shopId: '1',
        categoryId: '1',
        imageUrls: ['image1.jpg'],
        isAvailable: true,
        isVeg: true,
        unit: 'kg',
      };

      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(dto, adminUser);

      expect(result).toEqual(mockProduct);
    });

    it('should calculate discount percentage automatically', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        mrp: 100,
        sellingPrice: 80,
        stockQuantity: 10,
        shopId: '1',
        categoryId: '1',
        imageUrls: ['image1.jpg'],
        isAvailable: true,
        isVeg: true,
        unit: 'kg',
      };

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockProductRepo.create.mockReturnValue({
        ...mockProduct,
        discountPercentage: 20,
      });
      mockProductRepo.save.mockResolvedValue({
        ...mockProduct,
        discountPercentage: 20,
      });

      const result = await service.createProduct(dto, mockUser);

      expect(productRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discountPercentage: 20,
        })
      );
    });
  });

  describe('getAllProducts', () => {
    it('should get all products with filters', async () => {
      const query: FilterProductDto = {
        search: 'test',
        categoryId: '1',
        page: 1,
        limit: 10,
      };
      const mockProducts = [mockProduct];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockProducts, 1]),
      };

      mockProductRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllProducts(query);

      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('product.category', 'category');
    });

    it('should get all products without filters', async () => {
      const query: FilterProductDto = {};
      const mockProducts = [mockProduct];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockProducts, 1]),
      };

      mockProductRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllProducts(query);

      expect(productRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('should get product by id', async () => {
      const productId = '1';
      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      const result = await service.getProductById(productId);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['shop', 'shop.seller', 'category', 'subCategory'],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      const productId = '999';
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.getProductById(productId))
        .rejects.toThrow('Product not found');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productId = '1';
      const dto: UpdateProductDto = {
        name: 'Updated Product',
        mrp: 150,
      };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockProductRepo.save.mockResolvedValue({
        ...mockProduct,
        name: 'Updated Product',
        mrp: 150,
      });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['shop', 'shop.seller', 'category', 'subCategory'],
      });
      expect(productRepo.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          name: 'Updated Product',
          mrp: 150,
        })
      );
    });

    it('should throw error if product not found', async () => {
      const productId = '999';
      const dto: UpdateProductDto = { name: 'Updated Product' };

      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.updateProduct(productId, dto, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const productId = '1';
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteProduct(productId, mockUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['shop', 'shop.seller'],
      });
      expect(productRepo.delete).toHaveBeenCalledWith(productId);
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should throw error if product not found', async () => {
      const productId = '999';
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteProduct(productId, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });
});
