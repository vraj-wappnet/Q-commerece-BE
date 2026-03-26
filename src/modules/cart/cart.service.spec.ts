import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { Product } from '../products/entity/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: Repository<Cart>;
  let cartItemRepo: Repository<CartItem>;
  let productRepo: Repository<Product>;

  const mockCartRepo = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const mockCartItemRepo = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockProductRepo = {
    findOne: vi.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password',
    mobile: '1234567890',
    role: 4,
    isActive: true,
    isVerified: true,
    adminApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    sellingPrice: 50,
    stockQuantity: 10,
    isAvailable: true,
  } as Product;

  const mockCart = {
    id: 1,
    user: mockUser,
    isActive: true,
    items: [],
    totalAmount: 0,
    totalItems: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockCartRepo,
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockCartItemRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
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

  describe('getOrCreateCart', () => {
    it('should return existing cart', async () => {
      mockCartRepo.findOne.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart(mockUser);

      expect(cartRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id }, isActive: true },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(mockCart);
    });

    it('should create new cart if none exists', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      mockCartRepo.create.mockReturnValue(mockCart);
      mockCartRepo.save.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart(mockUser);

      expect(cartRepo.create).toHaveBeenCalledWith({
        user: { id: mockUser.id },
      });
      expect(cartRepo.save).toHaveBeenCalledWith(mockCart);
      expect(result).toEqual(mockCart);
    });
  });

  describe('addToCart', () => {
    const dto: AddToCartDto = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 2,
    };

    it('should add new item to cart', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(null);
      mockCartItemRepo.create.mockReturnValue({
        id: 1,
        quantity: 2,
        price: 50,
        totalPrice: 100,
        product: mockProduct,
      });
      mockCartItemRepo.save.mockResolvedValue({ id: 1 });
      mockCartRepo.save.mockResolvedValue(mockCart);
      mockCartRepo.findOne.mockResolvedValue({
        ...mockCart,
        items: [{ id: 1, quantity: 2, totalPrice: 100, product: mockProduct }],
      });

      const result = await service.addToCart(dto, mockUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.productId },
      });
      expect(result).toBeDefined();
    });

    it('should throw error if product not available', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.addToCart(dto, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if product is not available', async () => {
      const unavailableProduct = { ...mockProduct, isAvailable: false };
      mockProductRepo.findOne.mockResolvedValue(unavailableProduct);

      await expect(service.addToCart(dto, mockUser)).rejects.toThrow(
        'Product not available'
      );
    });

    it('should throw error if quantity exceeds stock', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCartRepo.findOne.mockResolvedValue({
        ...mockCart,
        items: [{ product: { id: dto.productId }, quantity: 9 }],
      });

      await expect(service.addToCart(dto, mockUser)).rejects.toThrow(
        'Cannot add 2 items. Only 1 items available in stock.'
      );
    });
  });

  describe('updateCart', () => {
    const dto: UpdateCartDto = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 3,
    };

    it('should update cart item quantity', async () => {
      const mockItem = {
        id: 1,
        product: mockProduct,
        quantity: 1,
        price: 50,
      };
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(mockItem);
      mockCartItemRepo.save.mockResolvedValue(mockItem);
      mockCartRepo.findOne.mockResolvedValue(mockCart);

      const result = await service.updateCart(dto, mockUser);

      expect(cartItemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 3,
          totalPrice: 150,
        })
      );
      expect(result).toBeDefined();
    });

    it('should delete item if quantity is 0 or less', async () => {
      const zeroQuantityDto = { ...dto, quantity: 0 };
      const mockItem = {
        id: 1,
        product: mockProduct,
        quantity: 1,
        price: 50,
      };
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(mockItem);
      mockCartItemRepo.delete.mockResolvedValue({ affected: 1 });
      mockCartRepo.findOne.mockResolvedValue(mockCart);

      const result = await service.updateCart(zeroQuantityDto, mockUser);

      expect(cartItemRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should throw error if item not in cart', async () => {
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(null);

      await expect(service.updateCart(dto, mockUser)).rejects.toThrow(
        'Item not in cart'
      );
    });

    it('should throw error if requested quantity exceeds stock', async () => {
      const mockItem = {
        id: 1,
        product: { ...mockProduct, stockQuantity: 2 },
        quantity: 1,
        price: 50,
      };
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(mockItem);

      await expect(service.updateCart(dto, mockUser)).rejects.toThrow(
        'Cannot update quantity to 3. Only 2 items available in stock.'
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const mockItem = { id: 1, cart: mockCart };
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(mockItem);
      mockCartItemRepo.delete.mockResolvedValue({ affected: 1 });
      mockCartRepo.findOne.mockResolvedValue(mockCart);

      const result = await service.removeItem(1, mockUser);

      expect(cartItemRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should throw error if item not found', async () => {
      mockCartRepo.findOne.mockResolvedValue(mockCart);
      mockCartItemRepo.findOne.mockResolvedValue(null);

      await expect(service.removeItem(1, mockUser)).rejects.toThrow(
        'Item not in cart'
      );
    });
  });

  describe('recalculateCart', () => {
    it('should recalculate cart totals', async () => {
      const cartWithItems = {
        ...mockCart,
        items: [
          { totalPrice: 100, quantity: 2 },
          { totalPrice: 50, quantity: 1 },
        ],
      };
      mockCartRepo.findOne.mockResolvedValue(cartWithItems);
      mockCartRepo.save.mockResolvedValue({
        ...cartWithItems,
        totalAmount: 150,
        totalItems: 3,
      });

      const result = await service.recalculateCart(1);

      expect(cartRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 150,
          totalItems: 3,
        })
      );
      expect(result).toBeDefined();
    });

    it('should throw error if cart not found', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);

      await expect(service.recalculateCart(1)).rejects.toThrow(
        'Cart not found'
      );
    });
  });
});
