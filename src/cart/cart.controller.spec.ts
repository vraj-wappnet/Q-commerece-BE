import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UserRole } from '../common/enum/roles.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;

  const mockCartService = {
    addToCart: vi.fn(),
    updateCart: vi.fn(),
    getOrCreateCart: vi.fn(),
    removeItem: vi.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: UserRole.CUSTOMER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const dto: AddToCartDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2,
      };
      const mockResult = { id: 1, totalItems: 2, totalAmount: 100 };

      mockCartService.addToCart.mockResolvedValue(mockResult);

      const result = await cartController.addToCart(dto, { user: mockUser });

      expect(cartService.addToCart).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateCart', () => {
    it('should update cart item successfully', async () => {
      const dto: UpdateCartDto = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 3,
      };
      const mockResult = { id: 1, totalItems: 3, totalAmount: 150 };

      mockCartService.updateCart.mockResolvedValue(mockResult);

      const result = await cartController.updateCart(dto, { user: mockUser });

      expect(cartService.updateCart).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCart', () => {
    it('should get user cart successfully', async () => {
      const mockCart = {
        id: 1,
        totalItems: 5,
        totalAmount: 250,
        items: [],
      };

      mockCartService.getOrCreateCart.mockResolvedValue(mockCart);

      const result = await cartController.getCart({ user: mockUser });

      expect(cartService.getOrCreateCart).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockCart);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart successfully', async () => {
      const itemId = 1;
      const mockResult = { id: 1, totalItems: 0, totalAmount: 0 };

      mockCartService.removeItem.mockResolvedValue(mockResult);

      const result = await cartController.removeItem(itemId, { user: mockUser });

      expect(cartService.removeItem).toHaveBeenCalledWith(itemId, mockUser);
      expect(result).toEqual(mockResult);
    });
  });
});
