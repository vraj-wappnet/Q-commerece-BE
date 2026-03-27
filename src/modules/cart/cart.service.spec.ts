import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartService } from './cart.service';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { Product } from '../products/entity/product.entity';
import { MESSAGES } from '../../common/constant/message';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: Repository<Cart>;
  let cartItemRepo: Repository<CartItem>;
  let productRepo: Repository<Product>;

  const mockUser = {
    id: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '1234567890',
  };

  const mockProduct = {
    id: 'product-uuid-123',
    name: 'Test Product',
    sellingPrice: 100,
    stockQuantity: 10,
    isAvailable: true,
  };

  const mockCartItem = {
    id: 1,
    quantity: 2,
    price: 100,
    totalPrice: 200,
    product: mockProduct,
  };

  const mockCart = {
    id: 1,
    user: mockUser,
    totalAmount: 200,
    totalItems: 2,
    isActive: true,
    items: [mockCartItem],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepo = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepo = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateCart', () => {
    it('should return existing cart for user', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);

      const result = await service.getOrCreateCart(mockUser);

      expect(cartRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id }, isActive: true },
        relations: ['items', 'items.product'],
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.FETCHED);
      expect(result.data).toEqual(mockCart);
    });

    it('should create new cart when user has no cart', async () => {
      const newCart = { ...mockCart, items: [] };
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(null);
      vi.spyOn(cartRepo, 'create').mockReturnValue(newCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(newCart as any);

      const result = await service.getOrCreateCart(mockUser);

      expect(cartRepo.create).toHaveBeenCalledWith({
        user: { id: mockUser.id },
      });
      expect(cartRepo.save).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.FETCHED);
      expect(result.data.items).toEqual([]);
    });
  });

  describe('addToCart', () => {
    const addToCartDto = {
      productId: 'product-uuid-123',
      quantity: 2,
    };

    it('should throw BadRequestException when product not found', async () => {
      vi.spyOn(productRepo, 'findOne').mockResolvedValue(null);

      await expect(service.addToCart(addToCartDto, mockUser)).rejects.toThrow(
        new BadRequestException('Product not available')
      );
    });

    it('should throw BadRequestException when product is not available', async () => {
      const unavailableProduct = { ...mockProduct, isAvailable: false };
      vi.spyOn(productRepo, 'findOne').mockResolvedValue(unavailableProduct as any);

      await expect(service.addToCart(addToCartDto, mockUser)).rejects.toThrow(
        new BadRequestException('Product not available')
      );
    });

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      const lowStockProduct = { ...mockProduct, stockQuantity: 1 };
      vi.spyOn(productRepo, 'findOne').mockResolvedValue(lowStockProduct as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);

      await expect(service.addToCart(addToCartDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.addToCart(addToCartDto, mockUser)).rejects.toThrow(
        /Only.*items available in stock/
      );
    });

    it('should add new item to cart when product not in cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      vi.spyOn(productRepo, 'findOne').mockResolvedValue(mockProduct as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(emptyCart as any);
      vi.spyOn(cartItemRepo, 'create').mockReturnValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'save').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(emptyCart as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce({ ...emptyCart, items: [mockCartItem] } as any);

      const result = await service.addToCart(addToCartDto, mockUser);

      expect(cartItemRepo.create).toHaveBeenCalledWith({
        cart: emptyCart,
        product: mockProduct,
        quantity: 2,
        price: 100,
        totalPrice: 200,
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.UPDATED);
    });

    it('should update existing item quantity when product already in cart', async () => {
      const existingItem = { ...mockCartItem, quantity: 1, totalPrice: 100 };
      const cartWithItem = { ...mockCart, items: [existingItem] };
      vi.spyOn(productRepo, 'findOne').mockResolvedValue(mockProduct as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(cartWithItem as any);
      vi.spyOn(cartItemRepo, 'save').mockResolvedValue({ ...existingItem, quantity: 3, totalPrice: 300 } as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(cartWithItem as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(cartWithItem as any);

      const result = await service.addToCart(addToCartDto, mockUser);

      expect(cartItemRepo.save).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.UPDATED);
    });

    it('should calculate prices with 2 decimal places', async () => {
      const productWithDecimal = { ...mockProduct, sellingPrice: 99.99 };
      const emptyCart = { ...mockCart, items: [] };
      vi.spyOn(productRepo, 'findOne').mockResolvedValue(productWithDecimal as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(emptyCart as any);
      vi.spyOn(cartItemRepo, 'create').mockReturnValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'save').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(emptyCart as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(emptyCart as any);

      await service.addToCart({ ...addToCartDto, quantity: 3 }, mockUser);

      expect(cartItemRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 99.99,
          totalPrice: 299.97,
        })
      );
    });
  });

  describe('updateCart', () => {
    const updateCartDto = {
      productId: 'product-uuid-123',
      quantity: 5,
    };

    it('should throw BadRequestException when item not in cart', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updateCart(updateCartDto, mockUser)).rejects.toThrow(
        new BadRequestException('Item not in cart')
      );
    });

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      const lowStockProduct = { ...mockProduct, stockQuantity: 3 };
      const item = { ...mockCartItem, product: lowStockProduct };
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(item as any);

      await expect(service.updateCart(updateCartDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.updateCart(updateCartDto, mockUser)).rejects.toThrow(
        /Only.*items available in stock/
      );
    });

    it('should delete item when quantity is 0', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(mockCart as any);

      const result = await service.updateCart({ ...updateCartDto, quantity: 0 }, mockUser);

      expect(cartItemRepo.delete).toHaveBeenCalledWith(mockCartItem.id);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.UPDATED);
    });

    it('should delete item when quantity is negative', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(mockCart as any);

      const result = await service.updateCart({ ...updateCartDto, quantity: -1 }, mockUser);

      expect(cartItemRepo.delete).toHaveBeenCalledWith(mockCartItem.id);
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should update item quantity successfully', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'save').mockResolvedValue({ ...mockCartItem, quantity: 5, totalPrice: 500 } as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(mockCart as any);

      const result = await service.updateCart(updateCartDto, mockUser);

      expect(cartItemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 5,
          totalPrice: 500,
        })
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.UPDATED);
    });

    it('should recalculate cart totals after update', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'save').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(mockCart as any);

      await service.updateCart(updateCartDto, mockUser);

      expect(cartRepo.save).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should throw BadRequestException when item not in cart', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(null);

      await expect(service.removeItem(999, mockUser)).rejects.toThrow(
        new BadRequestException('Item not in cart')
      );
    });

    it('should remove item successfully', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(mockCart as any);

      const result = await service.removeItem(1, mockUser);

      expect(cartItemRepo.delete).toHaveBeenCalledWith(mockCartItem.id);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.UPDATED);
    });

    it('should recalculate cart totals after removal', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartItemRepo, 'findOne').mockResolvedValue(mockCartItem as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(cartRepo, 'findOne').mockResolvedValueOnce(mockCart as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue(mockCart as any);

      await service.removeItem(1, mockUser);

      expect(cartRepo.save).toHaveBeenCalled();
    });
  });

  describe('getAllCarts', () => {
    it('should return paginated carts with default parameters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockCart], 1]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAllCarts({});

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.CART.LIST_FETCHED);
      expect(result.data.data).toEqual([mockCart]);
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
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ search: 'john' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%john%' })
      );
    });

    it('should apply userId filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ userId: 'user-123' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.id = :userId',
        { userId: 'user-123' }
      );
    });

    it('should apply isActive filter correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ isActive: false });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'cart.isActive = :isActive',
        { isActive: false }
      );
    });

    it('should apply amount range filters correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ minTotalAmount: 100, maxTotalAmount: 1000 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'cart.totalAmount >= :minTotalAmount',
        { minTotalAmount: 100 }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'cart.totalAmount <= :maxTotalAmount',
        { maxTotalAmount: 1000 }
      );
    });

    it('should throw BadRequestException for invalid createdFrom date', async () => {
      await expect(
        service.getAllCarts({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid createdFrom date'));
    });

    it('should throw BadRequestException for invalid createdTo date', async () => {
      await expect(
        service.getAllCarts({ createdTo: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid createdTo date'));
    });

    it('should throw BadRequestException for invalid updatedFrom date', async () => {
      await expect(
        service.getAllCarts({ updatedFrom: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid updatedFrom date'));
    });

    it('should throw BadRequestException for invalid updatedTo date', async () => {
      await expect(
        service.getAllCarts({ updatedTo: 'invalid-date' })
      ).rejects.toThrow(new BadRequestException('Invalid updatedTo date'));
    });

    it('should throw BadRequestException when createdFrom is after createdTo', async () => {
      await expect(
        service.getAllCarts({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(new BadRequestException('createdFrom must be before or equal to createdTo'));
    });

    it('should throw BadRequestException when updatedFrom is after updatedTo', async () => {
      await expect(
        service.getAllCarts({
          updatedFrom: '2026-12-31',
          updatedTo: '2026-01-01',
        })
      ).rejects.toThrow(new BadRequestException('updatedFrom must be before or equal to updatedTo'));
    });

    it('should apply date range filters correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        updatedFrom: '2026-01-01',
        updatedTo: '2026-12-31',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
    });

    it('should handle pagination correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockCart], 25]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAllCarts({ page: 2, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data.totalPages).toBe(3);
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
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ limit: 200 });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
    });

    it('should use default sort order DESC', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({});

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('cart.createdAt', 'DESC');
    });

    it('should apply custom sort field and order', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ sortBy: 'totalAmount', sortOrder: 'ASC' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('cart.totalAmount', 'ASC');
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
      vi.spyOn(cartRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllCarts({ sortBy: 'malicious; DROP TABLE carts;' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('cart.createdAt', 'DESC');
    });
  });
});
