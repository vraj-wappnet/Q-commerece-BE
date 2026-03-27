import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './entity/product.entity';
import { Shop } from '../shops/entity/shop.entity';
import { Category } from '../categories/entity/category.entity';
import { SubCategory } from '../categories/entity/sub-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { User } from '../auth/entity/user.entity';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
    role: { name: 'SELLER' } as any,
  } as any;

  const mockAdminUser: User = {
    id: '2',
    email: 'admin@example.com',
    role: { name: 'ADMIN' } as any,
  } as any;

  const mockShop: Shop = {
    id: '1',
    name: 'Test Shop',
    seller: { id: '1' } as any,
  } as any;

  const mockCategory: Category = {
    id: '1',
    name: 'Electronics',
  } as any;

  const mockSubCategory: SubCategory = {
    id: '1',
    name: 'Mobile Phones',
    category: { id: '1' } as any,
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
    discountPercentage: 10,
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
    const validDto: CreateProductDto = {
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

    it('should create a product successfully', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(validDto, mockUser);

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
      mockShopRepo.findOne.mockResolvedValue(null);

      try {
        await service.createProduct(validDto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Shop not found');
      }
    });

    it('should throw error if user not authorized for shop', async () => {
      const unauthorizedUser = { ...mockUser, id: '999' };
      mockShopRepo.findOne.mockResolvedValue(mockShop);

      try {
        await service.createProduct(validDto, unauthorizedUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('You are not authorized to add product to this shop');
      }
    });

    it('should allow admin to create product for any shop', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(validDto, mockAdminUser);

      expect(result).toEqual(mockProduct);
    });

    it('should throw error if category not found', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(null);

      try {
        await service.createProduct(validDto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Category not found');
      }
    });

    it('should throw error if subCategory not found', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(null);

      try {
        await service.createProduct(validDto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('SubCategory not found');
      }
    });

    it('should throw error if subCategory does not belong to category', async () => {
      const wrongSubCategory = {
        ...mockSubCategory,
        category: { id: '999' } as any,
      };

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(wrongSubCategory);

      try {
        await service.createProduct(validDto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('SubCategory does not belong to Category');
      }
    });

    it('should calculate discount percentage automatically when not provided', async () => {
      const dtoWithoutDiscount = { ...validDto };
      delete dtoWithoutDiscount.discountPercentage;

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.create.mockImplementation((data) => ({ ...mockProduct, ...data }));
      mockProductRepo.save.mockResolvedValue(mockProduct);

      await service.createProduct(dtoWithoutDiscount, mockUser);

      expect(productRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discountPercentage: 10,
        })
      );
    });

    it('should use provided discount percentage', async () => {
      const dtoWithDiscount = { ...validDto, discountPercentage: 15 };

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.create.mockImplementation((data) => ({ ...mockProduct, ...data }));
      mockProductRepo.save.mockResolvedValue(mockProduct);

      await service.createProduct(dtoWithDiscount, mockUser);

      expect(productRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discountPercentage: 15,
        })
      );
    });

    it('should create product without subCategory', async () => {
      const dtoWithoutSubCategory = { ...validDto };
      delete dtoWithoutSubCategory.subCategoryId;

      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.createProduct(dtoWithoutSubCategory, mockUser);

      expect(subCategoryRepo.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should handle database errors during save', async () => {
      mockShopRepo.findOne.mockResolvedValue(mockShop);
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockSubCategoryRepo.findOne.mockResolvedValue(mockSubCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createProduct(validDto, mockUser)).rejects.toThrow('Database error');
    });
  });

  describe('getAllProducts', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn(),
    };

    beforeEach(() => {
      mockProductRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should get all products with all filters', async () => {
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

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProduct], 1]);

      const result = await service.getAllProducts(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { search: '%test%' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('shop.id = :shopId', { shopId: '1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('category.id = :categoryId', { categoryId: '1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('subCategory.id = :subCategoryId', { subCategoryId: '1' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.name', 'ASC');
      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: [mockProduct],
      });
    });

    it('should get all products without filters', async () => {
      const query: FilterProductDto = {};

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProduct], 1]);

      const result = await service.getAllProducts(query);

      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by search term', async () => {
      const query: FilterProductDto = { search: 'mobile' };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getAllProducts(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { search: '%mobile%' }
      );
    });

    it('should filter by shopId only', async () => {
      const query: FilterProductDto = { shopId: '1' };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getAllProducts(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('shop.id = :shopId', { shopId: '1' });
    });

    it('should filter by categoryId only', async () => {
      const query: FilterProductDto = { categoryId: '1' };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getAllProducts(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('category.id = :categoryId', { categoryId: '1' });
    });

    it('should filter by subCategoryId only', async () => {
      const query: FilterProductDto = { subCategoryId: '1' };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getAllProducts(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('subCategory.id = :subCategoryId', { subCategoryId: '1' });
    });

    it('should handle pagination correctly', async () => {
      const query: FilterProductDto = { page: 3, limit: 20 };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 100]);

      const result = await service.getAllProducts(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(40);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result.totalPages).toBe(5);
    });

    it('should use default pagination values', async () => {
      const query: FilterProductDto = {};

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getAllProducts(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should limit maximum page size to 100', async () => {
      const query: FilterProductDto = { limit: 200 };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getAllProducts(query);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
      expect(result.limit).toBe(100);
    });

    it('should handle negative page numbers', async () => {
      const query: FilterProductDto = { page: -1 };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getAllProducts(query);

      expect(result.page).toBe(1);
    });

    it('should prevent SQL injection in sortBy', async () => {
      const query: FilterProductDto = { sortBy: 'DROP TABLE products' };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.getAllProducts(query);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
    });

    it('should handle allowed sortBy columns', async () => {
      const allowedColumns = ['createdAt', 'updatedAt', 'name', 'sellingPrice', 'mrp', 'stockQuantity'];

      for (const column of allowedColumns) {
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

        await service.getAllProducts({ sortBy: column });

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(`product.${column}`, 'DESC');
      }
    });

    it('should handle empty results', async () => {
      const query: FilterProductDto = {};

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getAllProducts(query);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle database errors', async () => {
      const query: FilterProductDto = {};

      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllProducts(query)).rejects.toThrow('Database error');
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

      try {
        await service.getProductById(productId);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Product not found');
      }
    });

    it('should include all relations', async () => {
      const productId = '1';
      const productWithRelations = {
        ...mockProduct,
        shop: mockShop,
        category: mockCategory,
        subCategory: mockSubCategory,
      };

      mockProductRepo.findOne.mockResolvedValue(productWithRelations);

      const result = await service.getProductById(productId);

      expect(result).toHaveProperty('shop');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('subCategory');
    });

    it('should handle database errors', async () => {
      const productId = '1';
      mockProductRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getProductById(productId)).rejects.toThrow('Database error');
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
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, ...dto });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, ...dto });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        relations: ['shop', 'shop.seller', 'category', 'subCategory'],
      });
      expect(productRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ name: 'Updated Product', mrp: 150 }));
    });

    it('should throw error if product not found', async () => {
      const productId = '999';
      const dto: UpdateProductDto = { name: 'Updated Product' };

      mockProductRepo.findOne.mockResolvedValue(null);

      try {
        await service.updateProduct(productId, dto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Product not found');
      }
    });

    it('should throw error if user not authorized', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { name: 'Updated Product' };
      const unauthorizedUser = { ...mockUser, id: '999' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      try {
        await service.updateProduct(productId, dto, unauthorizedUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Unauthorized to update this product');
      }
    });

    it('should allow admin to update any product', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { name: 'Updated Product' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, ...dto });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, ...dto });

      const result = await service.updateProduct(productId, dto, mockAdminUser);

      expect(result).toEqual(expect.objectContaining({ name: 'Updated Product' }));
    });

    it('should update shop if shopId provided and authorized', async () => {
      const productId = '1';
      const newShop = { ...mockShop, id: '2', seller: { id: '1' } as any };
      const dto: UpdateProductDto = { shopId: '2' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockShopRepo.findOne.mockResolvedValue(newShop);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, shop: newShop });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, shop: newShop });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(shopRepo.findOne).toHaveBeenCalledWith({
        where: { id: '2' },
        relations: ['seller'],
      });
      expect(result.shop).toEqual(newShop);
    });

    it('should throw error if new shop not found', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { shopId: '999' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockShopRepo.findOne.mockResolvedValue(null);

      try {
        await service.updateProduct(productId, dto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Shop not found');
      }
    });

    it('should throw error if not authorized to move product to new shop', async () => {
      const productId = '1';
      const newShop = { ...mockShop, id: '2', seller: { id: '999' } as any };
      const dto: UpdateProductDto = { shopId: '2' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockShopRepo.findOne.mockResolvedValue(newShop);

      try {
        await service.updateProduct(productId, dto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('You are not authorized to move product to this shop');
      }
    });

    it('should update category if categoryId provided', async () => {
      const productId = '1';
      const newCategory = { ...mockCategory, id: '2' };
      const dto: UpdateProductDto = { categoryId: '2' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCategoryRepo.findOne.mockResolvedValue(newCategory);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, category: newCategory });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, category: newCategory });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: '2' },
      });
      expect(result.category).toEqual(newCategory);
    });

    it('should throw error if new category not found', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { categoryId: '999' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCategoryRepo.findOne.mockResolvedValue(null);

      try {
        await service.updateProduct(productId, dto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Category not found');
      }
    });

    it('should update subCategory if subCategoryId provided', async () => {
      const productId = '1';
      const newSubCategory = { ...mockSubCategory, id: '2', category: { id: '1' } as any };
      const dto: UpdateProductDto = { subCategoryId: '2' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockSubCategoryRepo.findOne.mockResolvedValue(newSubCategory);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, subCategory: newSubCategory });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, subCategory: newSubCategory });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(subCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: '2' },
        relations: ['category'],
      });
      expect(result.subCategory).toEqual(newSubCategory);
    });

    it('should throw error if new subCategory not found', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { subCategoryId: '999' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockSubCategoryRepo.findOne.mockResolvedValue(null);

      try {
        await service.updateProduct(productId, dto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('SubCategory not found');
      }
    });

    it('should throw error if subCategory does not belong to category', async () => {
      const productId = '1';
      const wrongSubCategory = { ...mockSubCategory, id: '2', category: { id: '999' } as any };
      const dto: UpdateProductDto = { subCategoryId: '2' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockSubCategoryRepo.findOne.mockResolvedValue(wrongSubCategory);

      try {
        await service.updateProduct(productId, dto, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('SubCategory does not belong to Category');
      }
    });

    it('should clear subCategory when category changes and subCategory does not match', async () => {
      const productId = '1';
      const newCategory = { ...mockCategory, id: '2' };
      const dto: UpdateProductDto = { categoryId: '2' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCategoryRepo.findOne.mockResolvedValue(newCategory);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, category: newCategory, subCategory: null });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, category: newCategory, subCategory: null });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(result.subCategory).toBeNull();
    });

    it('should recalculate discount when pricing changes', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { mrp: 200, sellingPrice: 150 };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, ...dto, discountPercentage: 25 });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, ...dto, discountPercentage: 25 });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(result.discountPercentage).toBe(25);
    });

    it('should handle imageUrls update', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { imageUrls: ['new1.jpg', 'new2.jpg'] };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, images: dto.imageUrls });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, images: dto.imageUrls });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(result.images).toEqual(['new1.jpg', 'new2.jpg']);
    });

    it('should handle partial updates', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { stockQuantity: 20 };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, stockQuantity: 20 });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, stockQuantity: 20 });

      const result = await service.updateProduct(productId, dto, mockUser);

      expect(result.stockQuantity).toBe(20);
    });

    it('should handle database errors during update', async () => {
      const productId = '1';
      const dto: UpdateProductDto = { name: 'Updated Product' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.merge.mockReturnValue({ ...mockProduct, ...dto });
      mockProductRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(service.updateProduct(productId, dto, mockUser)).rejects.toThrow('Database error');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const productId = '1';
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.delete.mockResolvedValue({ affected: 1 } as any);

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

      try {
        await service.deleteProduct(productId, mockUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Product not found');
      }
    });

    it('should throw error if user not authorized', async () => {
      const productId = '1';
      const unauthorizedUser = { ...mockUser, id: '999' };

      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      try {
        await service.deleteProduct(productId, unauthorizedUser);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Unauthorized to delete this product');
      }
    });

    it('should allow admin to delete any product', async () => {
      const productId = '1';

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteProduct(productId, mockAdminUser);

      expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should handle database errors during delete', async () => {
      const productId = '1';

      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteProduct(productId, mockUser)).rejects.toThrow('Database error');
    });
  });
});
