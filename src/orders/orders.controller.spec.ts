import { Test, TestingModule } from '@nestjs/testing';
import { orderController } from './orders.controller';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { cancelOrderDto } from './dto/cancel-order.dto';
import { UserRole } from '../common/enum/roles.enum';
import { paymentMethod } from '../common/enum/status.enum';
import { Response } from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('orderController', () => {
  let controller: orderController;
  let orderService: OrderService;

  const mockOrderService = {
    createOrder: vi.fn(),
    getMyOrders: vi.fn(),
    getAllOrders: vi.fn(),
    getSellerOrder: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    cancelOrder: vi.fn(),
    assignDeliveryPerson: vi.fn(),
    generateInvoice: vi.fn(),
    acceptDelivery: vi.fn(),
    rejectDelivery: vi.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: UserRole.CUSTOMER,
  };

  const mockResponse = {
    set: vi.fn(),
    end: vi.fn(),
  } as any as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [orderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<orderController>(orderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const dto: CreateOrderDto = {
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        pincode: '400001',
        latitude: 19.076090,
        longitude: 72.877426,
        paymentMethod: paymentMethod.ONLINE_PAYMENT,
      };
      const mockOrder = { id: 1, totalAmount: 100 };

      mockOrderService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(dto, { user: mockUser });

      expect(orderService.createOrder).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getMyOrders', () => {
    it('should get user orders', async () => {
      const mockOrders = [{ id: 1, totalAmount: 100 }];

      mockOrderService.getMyOrders.mockResolvedValue(mockOrders);

      const result = await controller.getMyOrders({ user: mockUser });

      expect(orderService.getMyOrders).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders', async () => {
      const mockOrders = [{ id: 1, totalAmount: 100 }];

      mockOrderService.getAllOrders.mockResolvedValue(mockOrders);

      const result = await controller.getAllOrders();

      expect(orderService.getAllOrders).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getSellerOrders', () => {
    it('should get seller orders', async () => {
      const mockOrders = [{ id: 1, totalAmount: 100 }];

      mockOrderService.getSellerOrder.mockResolvedValue(mockOrders);

      const result = await controller.getSellerOrders({ user: mockUser });

      expect(orderService.getSellerOrder).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderById', () => {
    it('should get order by id', async () => {
      const orderId = '1';
      const mockOrder = { id: 1, totalAmount: 100 };

      mockOrderService.getOrderById.mockResolvedValue(mockOrder);

      const result = await controller.getOrderById({ user: mockUser }, orderId);

      expect(orderService.getOrderById).toHaveBeenCalledWith(orderId, mockUser);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const orderId = '1';
      const dto: UpdateOrderStatusDto = { status: 2 };
      const mockOrder = { id: 1, status: 2 };

      mockOrderService.updateOrderStatus.mockResolvedValue(mockOrder);

      const result = await controller.updateOrderStatus(orderId, dto);

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(orderId, dto.status);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const orderId = '1';
      const dto: UpdatePaymentStatusDto = { paymentStatus: 3 };
      const mockOrder = { id: 1, paymentStatus: 3 };

      mockOrderService.updatePaymentStatus.mockResolvedValue(mockOrder);

      const result = await controller.updatePaymentStatus(orderId, dto);

      expect(orderService.updatePaymentStatus).toHaveBeenCalledWith(orderId, dto.paymentStatus);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order', async () => {
      const orderId = '1';
      const dto: cancelOrderDto = { reason: 'Customer request' };
      const mockOrder = { id: 1, status: 7 };

      mockOrderService.cancelOrder.mockResolvedValue(mockOrder);

      const result = await controller.cancelOrder(orderId, { user: mockUser }, dto);

      expect(orderService.cancelOrder).toHaveBeenCalledWith(orderId, mockUser, dto.reason);
      expect(result).toEqual(mockOrder);
    });

    it('should cancel order with empty reason', async () => {
      const orderId = '1';
      const dto: cancelOrderDto = {};
      const mockOrder = { id: 1, status: 7 };

      mockOrderService.cancelOrder.mockResolvedValue(mockOrder);

      const result = await controller.cancelOrder(orderId, { user: mockUser }, dto);

      expect(orderService.cancelOrder).toHaveBeenCalledWith(orderId, mockUser, '');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('assignDelivery', () => {
    it('should assign delivery person', async () => {
      const orderId = '1';
      const mockOrder = { id: 1, deliveryPerson: { id: 2 } };

      mockOrderService.assignDeliveryPerson.mockResolvedValue(mockOrder);

      const result = await controller.assignDelivery(orderId);

      expect(orderService.assignDeliveryPerson).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('generateInvoice', () => {
    it('should generate invoice PDF', async () => {
      const orderId = '1';
      const pdfBuffer = Buffer.from('fake pdf content');

      mockOrderService.generateInvoice.mockResolvedValue(pdfBuffer);

      await controller.generateInvoice(orderId, mockResponse);

      expect(orderService.generateInvoice).toHaveBeenCalledWith(orderId);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${orderId}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      expect(mockResponse.end).toHaveBeenCalledWith(pdfBuffer);
    });
  });

  describe('acceptDelivery', () => {
    it('should accept delivery', async () => {
      const orderId = '1';
      const mockOrder = { id: 1, status: 4 };

      mockOrderService.acceptDelivery.mockResolvedValue(mockOrder);

      const result = await controller.acceptDelivery(orderId, { user: mockUser });

      expect(orderService.acceptDelivery).toHaveBeenCalledWith(orderId, mockUser);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('rejectDelivery', () => {
    it('should reject delivery', async () => {
      const orderId = '1';
      const mockOrder = { id: 1, status: 1 };

      mockOrderService.rejectDelivery.mockResolvedValue(mockOrder);

      const result = await controller.rejectDelivery(orderId, { user: mockUser });

      expect(orderService.rejectDelivery).toHaveBeenCalledWith(orderId, mockUser);
      expect(result).toEqual(mockOrder);
    });
  });
});
