import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderService } from './orders.service';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Cart } from '../cart/entity/cart.entity';
import { CartItem } from '../cart/entity/cart-item.entity';
import { Product } from '../products/entity/product.entity';
import { DeliveryProfile } from '../delivery_profiles/entity/delivery-profile.entity';
import { DeliveryAssignment } from '../order_delivery_assignment/entity/delivery_assignment.entity';
import { NotificationService } from '../notifications/notification.service';
import { OrderStatus, PaymentStatus, paymentMethod, AssignmentStatus, NotificationType } from '../../common/enum/status.enum';
import { MESSAGES } from '../../common/constant/message';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: Repository<Order>;
  let orderItemRepo: Repository<OrderItem>;
  let cartRepo: Repository<Cart>;
  let cartItemRepo: Repository<CartItem>;
  let productRepo: Repository<Product>;
  let deliveryProfileRepo: Repository<DeliveryProfile>;
  let deliveryAssignmentRepo: Repository<DeliveryAssignment>;
  let notificationService: NotificationService;

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
    stockQuantity: 10,
    isAvailable: true,
    shop: {
      seller: {
        id: 'seller-uuid-123',
      },
    },
  };

  const mockCartItem = {
    id: 'cart-item-uuid-123',
    quantity: 2,
    price: 100,
    totalPrice: 200,
    product: mockProduct,
  };

  const mockCart = {
    id: 'cart-uuid-123',
    user: mockUser,
    totalAmount: 500,
    totalItems: 2,
    isActive: true,
    items: [mockCartItem],
  };

  const mockOrder = {
    id: 'order-uuid-123',
    user: mockUser,
    totalAmount: 550,
    deliveryCharge: 50,
    totalItems: 2,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: paymentMethod.CASH_ON_DELIVERY,
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    latitude: 19.076090,
    longitude: 72.877426,
    isPaid: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    deliveryPerson: null,
    assignedAt: null,
    cancelReason: null,
    cancelledAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            createQueryBuilder: vi.fn(),
            query: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: vi.fn(),
            decrement: vi.fn(),
            increment: vi.fn(),
            update: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryProfile),
          useValue: {
            update: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryAssignment),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
          },
        },
        {
          provide: getQueueToken('delivery'),
          useValue: {
            add: vi.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepo = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    cartRepo = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepo = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    deliveryProfileRepo = module.get<Repository<DeliveryProfile>>(getRepositoryToken(DeliveryProfile));
    deliveryAssignmentRepo = module.get<Repository<DeliveryAssignment>>(getRepositoryToken(DeliveryAssignment));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto = {
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      latitude: 19.076090,
      longitude: 72.877426,
      paymentMethod: paymentMethod.CASH_ON_DELIVERY,
    };

    it('should throw BadRequestException when cart is empty', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(null);

      await expect(service.createOrder(createOrderDto, mockUser)).rejects.toThrow(
        new BadRequestException('Cart is empty')
      );
    });

    it('should throw BadRequestException when cart has no items', async () => {
      const emptyCart = { ...mockCart, items: [] };
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(emptyCart as any);

      await expect(service.createOrder(createOrderDto, mockUser)).rejects.toThrow(
        new BadRequestException('Cart is empty')
      );
    });

    it('should throw BadRequestException when product stock is insufficient', async () => {
      const insufficientStockCart = {
        ...mockCart,
        items: [{
          ...mockCartItem,
          quantity: 20,
          product: { ...mockProduct, stockQuantity: 5 },
        }],
      };
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(insufficientStockCart as any);

      await expect(service.createOrder(createOrderDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.createOrder(createOrderDto, mockUser)).rejects.toThrow(
        /Insufficient stock for product/
      );
    });

    it('should calculate delivery charge correctly when cart total < 600', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);
      vi.spyOn(orderRepo, 'create').mockReturnValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderItemRepo, 'create').mockImplementation((data: any) => data as any);
      vi.spyOn(orderItemRepo, 'save').mockResolvedValue([] as any);
      vi.spyOn(productRepo, 'decrement').mockResolvedValue({} as any);
      vi.spyOn(productRepo, 'findOne').mockResolvedValue({ ...mockProduct, stockQuantity: 8 } as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);
      vi.spyOn(service, 'autoAssignDelivery').mockResolvedValue(undefined);

      const result = await service.createOrder(createOrderDto, mockUser);

      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryCharge: 50,
          totalAmount: 550,
        })
      );
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGES.ORDER.CREATED);
    });

    it('should calculate delivery charge as 0 when cart total >= 600', async () => {
      const largeCart = { ...mockCart, totalAmount: 700 };
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(largeCart as any);
      vi.spyOn(orderRepo, 'create').mockReturnValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderItemRepo, 'create').mockImplementation((data: any) => data as any);
      vi.spyOn(orderItemRepo, 'save').mockResolvedValue([] as any);
      vi.spyOn(productRepo, 'decrement').mockResolvedValue({} as any);
      vi.spyOn(productRepo, 'findOne').mockResolvedValue({ ...mockProduct, stockQuantity: 8 } as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);
      vi.spyOn(service, 'autoAssignDelivery').mockResolvedValue(undefined);

      await service.createOrder(createOrderDto, mockUser);

      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryCharge: 0,
          totalAmount: 700,
        })
      );
    });

    it('should reduce product stock and mark as unavailable when stock reaches 0', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);
      vi.spyOn(orderRepo, 'create').mockReturnValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderItemRepo, 'create').mockImplementation((data: any) => data as any);
      vi.spyOn(orderItemRepo, 'save').mockResolvedValue([] as any);
      vi.spyOn(productRepo, 'decrement').mockResolvedValue({} as any);
      vi.spyOn(productRepo, 'findOne').mockResolvedValue({ ...mockProduct, stockQuantity: 0 } as any);
      vi.spyOn(productRepo, 'update').mockResolvedValue({} as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);
      vi.spyOn(service, 'autoAssignDelivery').mockResolvedValue(undefined);

      await service.createOrder(createOrderDto, mockUser);

      expect(productRepo.update).toHaveBeenCalledWith(
        { id: mockProduct.id },
        { isAvailable: false }
      );
    });

    it('should send notification to seller and auto-assign delivery', async () => {
      vi.spyOn(cartRepo, 'findOne').mockResolvedValue(mockCart as any);
      vi.spyOn(orderRepo, 'create').mockReturnValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderItemRepo, 'create').mockImplementation((data: any) => data as any);
      vi.spyOn(orderItemRepo, 'save').mockResolvedValue([] as any);
      vi.spyOn(productRepo, 'decrement').mockResolvedValue({} as any);
      vi.spyOn(productRepo, 'findOne').mockResolvedValue({ ...mockProduct, stockQuantity: 8 } as any);
      vi.spyOn(cartRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(cartItemRepo, 'delete').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);
      vi.spyOn(service, 'autoAssignDelivery').mockResolvedValue(undefined);

      await service.createOrder(createOrderDto, mockUser);

      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        user: { id: 'seller-uuid-123' },
        title: 'New Order',
        message: 'You have a new order',
        type: NotificationType.ORDER_PLACED,
      });
      expect(service.autoAssignDelivery).toHaveBeenCalledWith(mockOrder.id);
    });
  });

  describe('getMyOrders', () => {
    it('should return user orders with correct structure', async () => {
      const orders = [mockOrder];
      vi.spyOn(orderRepo, 'find').mockResolvedValue(orders as any);

      const result = await service.getMyOrders(mockUser);

      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.ORDER.FETCHED);
      expect(result.data).toEqual(orders);
    });

    it('should return empty array when user has no orders', async () => {
      vi.spyOn(orderRepo, 'find').mockResolvedValue([]);

      const result = await service.getMyOrders(mockUser);

      expect(result.data).toEqual([]);
    });
  });

  describe('getOrderById', () => {
    it('should return order by id for authenticated user', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);

      const result = await service.getOrderById(mockOrder.id, mockUser);

      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockOrder.id, user: { id: mockUser.id } },
        relations: ['items', 'items.product'],
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.ORDER.FETCHED);
      expect(result.data).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(null);

      const result = await service.getOrderById('non-existent-id', mockUser);

      expect(result.data).toBeNull();
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders with default parameters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockOrder], 1]),
      };
      vi.spyOn(orderRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAllOrders({});

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.ORDER.FETCHED);
      expect(result.data.items).toEqual([mockOrder]);
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
      vi.spyOn(orderRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllOrders({ search: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%test%' })
      );
    });

    it('should throw BadRequestException for invalid date range', async () => {
      await expect(
        service.getAllOrders({
          createdFrom: '2026-12-31',
          createdTo: '2026-01-01',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      await expect(
        service.getAllOrders({ createdFrom: 'invalid-date' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should apply all filters correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      vi.spyOn(orderRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.getAllOrders({
        userId: 'user-123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.COMPLETED,
        isPaid: true,
        minTotalAmount: 100,
        maxTotalAmount: 1000,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(6);
    });

    it('should handle pagination correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockOrder], 25]),
      };
      vi.spyOn(orderRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getAllOrders({ page: 2, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data.totalPages).toBe(3);
      expect(result.data.hasNextPage).toBe(true);
      expect(result.data.hasPreviousPage).toBe(true);
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw BadRequestException when order not found', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('non-existent-id', OrderStatus.CONFIRMED)
      ).rejects.toThrow(new BadRequestException('Order not found'));
    });

    it('should update order status successfully', async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue(updatedOrder as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      const result = await service.updateOrderStatus(mockOrder.id, OrderStatus.CONFIRMED);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.ORDER.UPDATED);
      expect(result.data.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should free delivery person when order is delivered', async () => {
      const orderWithDelivery = {
        ...mockOrder,
        status: OrderStatus.OUT_FOR_DELIVERY,
        deliveryPerson: { id: 'delivery-uuid-123' },
      };
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(orderWithDelivery as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(deliveryProfileRepo, 'update').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      await service.updateOrderStatus(mockOrder.id, OrderStatus.DELIVERED);

      expect(deliveryProfileRepo.update).toHaveBeenCalledWith(
        { user: { id: 'delivery-uuid-123' } },
        { isAvailable: true }
      );
    });

    it('should send notification when status is updated', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue(mockOrder as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      await service.updateOrderStatus(mockOrder.id, OrderStatus.PACKED);

      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        user: { id: mockUser.id },
        title: 'Order Status Updated',
        message: expect.stringContaining('PACKED'),
        type: NotificationType.ORDER_STATUS,
      });
    });
  });

  describe('cancelOrder', () => {
    it('should throw BadRequestException when order not found', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.cancelOrder('non-existent-id', mockUser, 'Test reason')
      ).rejects.toThrow(new BadRequestException('Order not found'));
    });

    it('should throw BadRequestException when order is out for delivery', async () => {
      const deliveryOrder = { ...mockOrder, status: OrderStatus.OUT_FOR_DELIVERY };
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(deliveryOrder as any);

      await expect(
        service.cancelOrder(mockOrder.id, mockUser, 'Test reason')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order is already delivered', async () => {
      const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(deliveredOrder as any);

      await expect(
        service.cancelOrder(mockOrder.id, mockUser, 'Test reason')
      ).rejects.toThrow(BadRequestException);
    });

    it('should restore product stock when order is cancelled', async () => {
      const orderWithItems = {
        ...mockOrder,
        items: [{
          product: { id: 'product-123' },
          quantity: 2,
        }],
      };
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(orderWithItems as any);
      vi.spyOn(productRepo, 'increment').mockResolvedValue({} as any);
      vi.spyOn(productRepo, 'findOne').mockResolvedValue({ stockQuantity: 5, isAvailable: false } as any);
      vi.spyOn(productRepo, 'update').mockResolvedValue({} as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);

      await service.cancelOrder(mockOrder.id, mockUser, 'Test reason');

      expect(productRepo.increment).toHaveBeenCalledWith(
        { id: 'product-123' },
        'stockQuantity',
        2
      );
      expect(productRepo.update).toHaveBeenCalledWith(
        { id: 'product-123' },
        { isAvailable: true }
      );
    });

    it('should set cancel reason and timestamp', async () => {
      const orderWithItems = { ...mockOrder, items: [] };
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(orderWithItems as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);

      const result = await service.cancelOrder(mockOrder.id, mockUser, 'Customer request');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.ORDER.CANCELLED);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should throw BadRequestException when order not found', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updatePaymentStatus('non-existent-id', PaymentStatus.COMPLETED)
      ).rejects.toThrow(new BadRequestException('Order not found'));
    });

    it('should update payment status and set isPaid to true when completed', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      await service.updatePaymentStatus(mockOrder.id, PaymentStatus.COMPLETED);

      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: PaymentStatus.COMPLETED,
          isPaid: true,
        })
      );
    });

    it('should set isPaid to false when payment failed', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      await service.updatePaymentStatus(mockOrder.id, PaymentStatus.FAILED);

      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: PaymentStatus.FAILED,
          isPaid: false,
        })
      );
    });

    it('should send notification when payment status is updated', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      await service.updatePaymentStatus(mockOrder.id, PaymentStatus.COMPLETED);

      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        user: { id: mockUser.id },
        title: 'Payment Status Updated',
        message: expect.stringContaining('COMPLETED'),
        type: NotificationType.ORDER_STATUS,
      });
    });
  });

  describe('acceptDelivery', () => {
    it('should throw BadRequestException when assignment not found', async () => {
      vi.spyOn(deliveryAssignmentRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.acceptDelivery(mockOrder.id, { userId: 'delivery-123' })
      ).rejects.toThrow(new BadRequestException('No assignment Found'));
    });

    it('should accept delivery and update order status', async () => {
      const assignment = {
        id: 'assignment-123',
        status: AssignmentStatus.PENDING,
      };
      vi.spyOn(deliveryAssignmentRepo, 'findOne').mockResolvedValue(assignment as any);
      vi.spyOn(deliveryAssignmentRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(orderRepo, 'update').mockResolvedValue({} as any);
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(notificationService, 'sendNotification').mockResolvedValue({} as any);

      const result = await service.acceptDelivery(mockOrder.id, { userId: 'delivery-123' });

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.DELIVERY.ACCEPTED);
      expect(deliveryAssignmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: AssignmentStatus.ACCEPTED })
      );
    });
  });

  describe('rejectDelivery', () => {
    it('should throw BadRequestException when assignment not found', async () => {
      vi.spyOn(deliveryAssignmentRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.rejectDelivery(mockOrder.id, { userId: 'delivery-123' })
      ).rejects.toThrow(new BadRequestException('No assignment Found'));
    });

    it('should reject delivery and reassign', async () => {
      const assignment = {
        id: 'assignment-123',
        status: AssignmentStatus.PENDING,
      };
      vi.spyOn(deliveryAssignmentRepo, 'findOne').mockResolvedValue(assignment as any);
      vi.spyOn(deliveryAssignmentRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(service, 'assignDeliveryPerson').mockResolvedValue({} as any);

      const result = await service.rejectDelivery(mockOrder.id, { userId: 'delivery-123' });

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.DELIVERY.REJECTED);
      expect(service.assignDeliveryPerson).toHaveBeenCalledWith(mockOrder.id);
    });
  });

  describe('confirmPayment', () => {
    it('should throw BadRequestException when order not found', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.confirmPayment('non-existent-id')
      ).rejects.toThrow(new BadRequestException('Order Not Found'));
    });

    it('should confirm payment and auto-assign delivery', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);
      vi.spyOn(orderRepo, 'save').mockResolvedValue({} as any);
      vi.spyOn(service, 'autoAssignDelivery').mockResolvedValue(undefined);

      const result = await service.confirmPayment(mockOrder.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGES.PAYMENT.SUCCESS);
      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isPaid: true,
          paymentStatus: PaymentStatus.COMPLETED,
          status: OrderStatus.CONFIRMED,
        })
      );
      expect(service.autoAssignDelivery).toHaveBeenCalledWith(mockOrder.id);
    });
  });

  describe('trackOrder', () => {
    it('should throw BadRequestException when order not found', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.trackOrder('non-existent-id')
      ).rejects.toThrow(new BadRequestException('Order not found'));
    });

    it('should return order tracking information', async () => {
      vi.spyOn(orderRepo, 'findOne').mockResolvedValue(mockOrder as any);

      const result = await service.trackOrder(mockOrder.id);

      expect(result).toEqual(mockOrder);
      expect(orderRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockOrder.id },
          relations: expect.arrayContaining(['items', 'items.product', 'user']),
        })
      );
    });
  });
});
