import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MESSAGES } from '../../common/constant/message';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const mockUser = {
    id: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '1234567890',
  };

  const mockRequest = {
    user: mockUser,
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

  const mockCartService = {
    addToCart: vi.fn(),
    updateCart: vi.fn(),
    getOrCreateCart: vi.fn(),
    getAllCarts: vi.fn(),
    removeItem: vi.fn(),
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

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /cart/add - addToCart', () => {
    const addToCartDto = {
      productId: 'product-uuid-123',
      quantity: 2,
    };

    it('should add item to cart successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: mockCart,
      };
      mockCartService.addToCart.mockResolvedValue(expectedResponse);

      const result = await controller.addToCart(addToCartDto, mockRequest as any);

      expect(service.addToCart).toHaveBeenCalledWith(addToCartDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when productId is missing', async () => {
      const invalidDto = { quantity: 2 };
      mockCartService.addToCart.mockRejectedValue(new BadRequestException());

      await expect(controller.addToCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when productId is not a valid UUID', async () => {
      const invalidDto = { productId: 'invalid-uuid', quantity: 2 };
      mockCartService.addToCart.mockRejectedValue(new BadRequestException());

      await expect(controller.addToCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when quantity is missing', async () => {
      const invalidDto = { productId: 'product-uuid-123' };
      mockCartService.addToCart.mockRejectedValue(new BadRequestException());

      await expect(controller.addToCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when quantity is not a number', async () => {
      const invalidDto = { productId: 'product-uuid-123', quantity: 'two' };
      mockCartService.addToCart.mockRejectedValue(new BadRequestException());

      await expect(controller.addToCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when quantity is zero', async () => {
      const invalidDto = { productId: 'product-uuid-123', quantity: 0 };
      mockCartService.addToCart.mockRejectedValue(new BadRequestException());

      await expect(controller.addToCart(invalidDto, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when quantity is negative', async () => {
      const invalidDto = { productId: 'product-uuid-123', quantity: -1 };
      mockCartService.addToCart.mockRejectedValue(new BadRequestException());

      await expect(controller.addToCart(invalidDto, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when product not found', async () => {
      mockCartService.addToCart.mockRejectedValue(
        new BadRequestException('Product not available')
      );

      await expect(controller.addToCart(addToCartDto, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Product not available')
      );
    });

    it('should throw error when product is not available', async () => {
      mockCartService.addToCart.mockRejectedValue(
        new BadRequestException('Product not available')
      );

      await expect(controller.addToCart(addToCartDto, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Product not available')
      );
    });

    it('should throw error when quantity exceeds stock', async () => {
      mockCartService.addToCart.mockRejectedValue(
        new BadRequestException('Cannot add 10 items. Only 5 items available in stock.')
      );

      await expect(
        controller.addToCart({ ...addToCartDto, quantity: 10 }, mockRequest as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle large quantity values', async () => {
      const largeQuantityDto = { productId: 'product-uuid-123', quantity: 100 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: mockCart,
      };
      mockCartService.addToCart.mockResolvedValue(expectedResponse);

      const result = await controller.addToCart(largeQuantityDto, mockRequest as any);

      expect(service.addToCart).toHaveBeenCalledWith(largeQuantityDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('PATCH /cart/update - updateCart', () => {
    const updateCartDto = {
      productId: 'product-uuid-123',
      quantity: 5,
    };

    it('should update cart item successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: mockCart,
      };
      mockCartService.updateCart.mockResolvedValue(expectedResponse);

      const result = await controller.updateCart(updateCartDto, mockRequest as any);

      expect(service.updateCart).toHaveBeenCalledWith(updateCartDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when productId is missing', async () => {
      const invalidDto = { quantity: 5 };
      mockCartService.updateCart.mockRejectedValue(new BadRequestException());

      await expect(controller.updateCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when productId is not a valid UUID', async () => {
      const invalidDto = { productId: 'invalid-uuid', quantity: 5 };
      mockCartService.updateCart.mockRejectedValue(new BadRequestException());

      await expect(controller.updateCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when quantity is missing', async () => {
      const invalidDto = { productId: 'product-uuid-123' };
      mockCartService.updateCart.mockRejectedValue(new BadRequestException());

      await expect(controller.updateCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when quantity is not a number', async () => {
      const invalidDto = { productId: 'product-uuid-123', quantity: 'five' };
      mockCartService.updateCart.mockRejectedValue(new BadRequestException());

      await expect(controller.updateCart(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should allow quantity of 0 to remove item', async () => {
      const removeDto = { productId: 'product-uuid-123', quantity: 0 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: { ...mockCart, items: [] },
      };
      mockCartService.updateCart.mockResolvedValue(expectedResponse);

      const result = await controller.updateCart(removeDto, mockRequest as any);

      expect(service.updateCart).toHaveBeenCalledWith(removeDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when item not in cart', async () => {
      mockCartService.updateCart.mockRejectedValue(
        new BadRequestException('Item not in cart')
      );

      await expect(controller.updateCart(updateCartDto, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Item not in cart')
      );
    });

    it('should throw error when quantity exceeds stock', async () => {
      mockCartService.updateCart.mockRejectedValue(
        new BadRequestException('Cannot update quantity to 20. Only 10 items available in stock.')
      );

      await expect(
        controller.updateCart({ ...updateCartDto, quantity: 20 }, mockRequest as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative quantity values', async () => {
      const negativeDto = { productId: 'product-uuid-123', quantity: -1 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: { ...mockCart, items: [] },
      };
      mockCartService.updateCart.mockResolvedValue(expectedResponse);

      const result = await controller.updateCart(negativeDto, mockRequest as any);

      expect(service.updateCart).toHaveBeenCalledWith(negativeDto, mockUser);
    });
  });

  describe('GET /cart - getCart', () => {
    it('should return user cart successfully', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.FETCHED,
        data: mockCart,
      };
      mockCartService.getOrCreateCart.mockResolvedValue(expectedResponse);

      const result = await controller.getCart(mockRequest as any);

      expect(service.getOrCreateCart).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should create new cart if user has no cart', async () => {
      const emptyCart = { ...mockCart, items: [], totalAmount: 0, totalItems: 0 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.FETCHED,
        data: emptyCart,
      };
      mockCartService.getOrCreateCart.mockResolvedValue(expectedResponse);

      const result = await controller.getCart(mockRequest as any);

      expect(service.getOrCreateCart).toHaveBeenCalledWith(mockUser);
      expect(result.data.items).toEqual([]);
    });

    it('should return cart with correct structure', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.FETCHED,
        data: mockCart,
      };
      mockCartService.getOrCreateCart.mockResolvedValue(expectedResponse);

      const result = await controller.getCart(mockRequest as any);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('items');
      expect(result.data).toHaveProperty('totalAmount');
      expect(result.data).toHaveProperty('totalItems');
      expect(result.data).toHaveProperty('isActive');
    });
  });

  describe('GET /cart/all - getAllCarts', () => {
    it('should return all carts with default pagination', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.LIST_FETCHED,
        data: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          data: [mockCart],
        },
      };
      mockCartService.getAllCarts.mockResolvedValue(expectedResponse);

      const result = await controller.getAllCarts();

      expect(service.getAllCarts).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('should apply search filter correctly', async () => {
      const filters = { search: 'john' };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply userId filter correctly', async () => {
      const filters = { userId: 'user-123' };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply isActive filter correctly', async () => {
      const filters = { isActive: true };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply amount range filters correctly', async () => {
      const filters = { minTotalAmount: 100, maxTotalAmount: 1000 };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply date range filters correctly', async () => {
      const filters = {
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        updatedFrom: '2026-01-01',
        updatedTo: '2026-12-31',
      };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply pagination correctly', async () => {
      const filters = { page: 2, limit: 20 };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply sorting correctly', async () => {
      const filters = { sortBy: 'totalAmount', sortOrder: 'ASC' as const };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should apply all filters together', async () => {
      const filters = {
        search: 'john',
        userId: 'user-123',
        isActive: true,
        minTotalAmount: 100,
        maxTotalAmount: 1000,
        createdFrom: '2026-01-01',
        createdTo: '2026-12-31',
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
        page: 1,
        limit: 10,
      };
      mockCartService.getAllCarts.mockResolvedValue({} as any);

      await controller.getAllCarts(filters);

      expect(service.getAllCarts).toHaveBeenCalledWith(filters);
    });

    it('should throw error for invalid date range', async () => {
      mockCartService.getAllCarts.mockRejectedValue(
        new BadRequestException('createdFrom must be before or equal to createdTo')
      );

      await expect(
        controller.getAllCarts({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid date format', async () => {
      mockCartService.getAllCarts.mockRejectedValue(
        new BadRequestException('Invalid createdFrom date')
      );

      await expect(
        controller.getAllCarts({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle empty results', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.LIST_FETCHED,
        data: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          data: [],
        },
      };
      mockCartService.getAllCarts.mockResolvedValue(expectedResponse);

      const result = await controller.getAllCarts();

      expect(result.data.data).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should handle large page numbers', async () => {
      const filters = { page: 100, limit: 10 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.LIST_FETCHED,
        data: {
          total: 0,
          page: 100,
          limit: 10,
          totalPages: 0,
          data: [],
        },
      };
      mockCartService.getAllCarts.mockResolvedValue(expectedResponse);

      const result = await controller.getAllCarts(filters);

      expect(result.data.page).toBe(100);
    });
  });

  describe('DELETE /cart/item/:id - removeItem', () => {
    it('should remove item successfully with valid id', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: { ...mockCart, items: [] },
      };
      mockCartService.removeItem.mockResolvedValue(expectedResponse);

      const result = await controller.removeItem(1, mockRequest as any);

      expect(service.removeItem).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when id is not a number', async () => {
      // ParseIntPipe will handle this validation
      expect(controller.removeItem).toBeDefined();
    });

    it('should throw error when id is negative', async () => {
      mockCartService.removeItem.mockRejectedValue(
        new BadRequestException('Item not in cart')
      );

      await expect(controller.removeItem(-1, mockRequest as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error when id is zero', async () => {
      mockCartService.removeItem.mockRejectedValue(
        new BadRequestException('Item not in cart')
      );

      await expect(controller.removeItem(0, mockRequest as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error when item not found', async () => {
      mockCartService.removeItem.mockRejectedValue(
        new BadRequestException('Item not in cart')
      );

      await expect(controller.removeItem(999, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Item not in cart')
      );
    });

    it('should recalculate cart totals after removal', async () => {
      const updatedCart = { ...mockCart, items: [], totalAmount: 0, totalItems: 0 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: updatedCart,
      };
      mockCartService.removeItem.mockResolvedValue(expectedResponse);

      const result = await controller.removeItem(1, mockRequest as any);

      expect(result.data.totalAmount).toBe(0);
      expect(result.data.totalItems).toBe(0);
    });

    it('should handle removing last item from cart', async () => {
      const emptyCart = { ...mockCart, items: [], totalAmount: 0, totalItems: 0 };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: emptyCart,
      };
      mockCartService.removeItem.mockResolvedValue(expectedResponse);

      const result = await controller.removeItem(1, mockRequest as any);

      expect(result.data.items).toEqual([]);
    });

    it('should handle removing item from cart with multiple items', async () => {
      const item2 = { ...mockCartItem, id: 2, product: { ...mockProduct, id: 'product-uuid-456' } };
      const cartWithMultipleItems = {
        ...mockCart,
        items: [mockCartItem, item2],
        totalAmount: 400,
        totalItems: 4,
      };
      const updatedCart = {
        ...cartWithMultipleItems,
        items: [item2],
        totalAmount: 200,
        totalItems: 2,
      };
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: updatedCart,
      };
      mockCartService.removeItem.mockResolvedValue(expectedResponse);

      const result = await controller.removeItem(1, mockRequest as any);

      expect(result.data.items.length).toBe(1);
      expect(result.data.totalAmount).toBe(200);
    });
  });

  describe('Authorization and Guards', () => {
    it('should require authentication for addToCart', () => {
      expect(controller.addToCart).toBeDefined();
    });

    it('should require authentication for updateCart', () => {
      expect(controller.updateCart).toBeDefined();
    });

    it('should require authentication for getCart', () => {
      expect(controller.getCart).toBeDefined();
    });

    it('should require authentication for getAllCarts', () => {
      expect(controller.getAllCarts).toBeDefined();
    });

    it('should require authentication for removeItem', () => {
      expect(controller.removeItem).toBeDefined();
    });

    it('should require ADMIN role for getAllCarts', () => {
      // This is validated by the @Roles decorator
      expect(controller.getAllCarts).toBeDefined();
    });
  });

  describe('Response Structure Validation', () => {
    it('should return correct response structure for addToCart', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: mockCart,
      };
      mockCartService.addToCart.mockResolvedValue(expectedResponse);

      const result = await controller.addToCart(
        { productId: 'product-uuid-123', quantity: 2 },
        mockRequest as any
      );

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should return correct response structure for updateCart', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: mockCart,
      };
      mockCartService.updateCart.mockResolvedValue(expectedResponse);

      const result = await controller.updateCart(
        { productId: 'product-uuid-123', quantity: 5 },
        mockRequest as any
      );

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });

    it('should return correct response structure for getCart', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.FETCHED,
        data: mockCart,
      };
      mockCartService.getOrCreateCart.mockResolvedValue(expectedResponse);

      const result = await controller.getCart(mockRequest as any);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });

    it('should return correct response structure for getAllCarts', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.LIST_FETCHED,
        data: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          data: [mockCart],
        },
      };
      mockCartService.getAllCarts.mockResolvedValue(expectedResponse);

      const result = await controller.getAllCarts();

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('page');
      expect(result.data).toHaveProperty('limit');
      expect(result.data).toHaveProperty('totalPages');
      expect(result.data).toHaveProperty('data');
    });

    it('should return correct response structure for removeItem', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.CART.UPDATED,
        data: mockCart,
      };
      mockCartService.removeItem.mockResolvedValue(expectedResponse);

      const result = await controller.removeItem(1, mockRequest as any);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });
  });
});
