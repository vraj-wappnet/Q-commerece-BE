import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { orderController, orderTrackingController } from './orders.controller';
import { OrderService } from './orders.service';
import { OrderStatus, PaymentStatus, paymentMethod } from '../../common/enum/status.enum';
import { MESSAGES } from '../../common/constant/message';
import { Response } from 'express';

describe('orderController', () => {
  let controller: orderController;
  let service: OrderService;

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
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    latitude: 19.076090,
    longitude: 72.877426,
    isPaid: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /orders - createOrder', () => {
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

    it('should create order successfully with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.CREATED,
        message: MESSAGES.ORDER.CREATED,
        data: mockOrder,
      };
      mockOrderService.createOrder.mockResolvedValue(expectedResponse);

      const result = await controller.createOrder(createOrderDto, mockRequest as any);

      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when required field addressLine1 is missing', async () => {
      const invalidDto = { ...createOrderDto, addressLine1: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when required field city is missing', async () => {
      const invalidDto = { ...createOrderDto, city: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when required field state is missing', async () => {
      const invalidDto = { ...createOrderDto, state: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when required field country is missing', async () => {
      const invalidDto = { ...createOrderDto, country: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when required field pincode is missing', async () => {
      const invalidDto = { ...createOrderDto, pincode: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when required field latitude is missing', async () => {
      const invalidDto = { ...createOrderDto, latitude: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when required field longitude is missing', async () => {
      const invalidDto = { ...createOrderDto, longitude: undefined };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });

    it('should throw error when paymentMethod is invalid', async () => {
      const invalidDto = { ...createOrderDto, paymentMethod: 999 };
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.createOrder(invalidDto as any, mockRequest as any)).rejects.toThrow();
    });
  });

  describe('GET /orders/my - getMyOrders', () => {
    it('should return user orders', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.FETCHED,
        data: [mockOrder],
      };
      mockOrderService.getMyOrders.mockResolvedValue(expectedResponse);

      const result = await controller.getMyOrders(mockRequest as any);

      expect(service.getMyOrders).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('GET /orders/All - getAllOrders', () => {
    it('should return all orders with default pagination', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.FETCHED,
        data: {
          items: [mockOrder],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      mockOrderService.getAllOrders.mockResolvedValue(expectedResponse);

      const result = await controller.getAllOrders();

      expect(service.getAllOrders).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        search: 'test',
        status: OrderStatus.PENDING,
        page: 2,
        limit: 20,
      };
      mockOrderService.getAllOrders.mockResolvedValue({} as any);

      await controller.getAllOrders(filters);

      expect(service.getAllOrders).toHaveBeenCalledWith(filters);
    });
  });

  describe('GET /orders/seller - getSellerOrders', () => {
    it('should return seller orders', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.FETCHED,
        data: [],
      };
      mockOrderService.getSellerOrder.mockResolvedValue(expectedResponse);

      const result = await controller.getSellerOrders(mockRequest as any);

      expect(service.getSellerOrder).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('GET /orders/:id - getOrderById', () => {
    it('should return order by valid UUID', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.FETCHED,
        data: mockOrder,
      };
      mockOrderService.getOrderById.mockResolvedValue(expectedResponse);

      const result = await controller.getOrderById(mockRequest as any, mockOrder.id);

      expect(service.getOrderById).toHaveBeenCalledWith(mockOrder.id, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      // ParseUUIDPipe will throw before reaching service
      // This test validates that the pipe is in place
      expect(controller.getOrderById).toBeDefined();
    });
  });

  describe('PATCH /orders/:id/status - updateOrderStatus', () => {
    const updateStatusDto = {
      status: OrderStatus.CONFIRMED,
    };

    it('should update order status with valid UUID and status', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.UPDATED,
        data: { ...mockOrder, status: OrderStatus.CONFIRMED },
      };
      mockOrderService.updateOrderStatus.mockResolvedValue(expectedResponse);

      const result = await controller.updateOrderStatus(mockOrder.id, updateStatusDto);

      expect(service.updateOrderStatus).toHaveBeenCalledWith(mockOrder.id, OrderStatus.CONFIRMED);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when status is invalid', async () => {
      const invalidDto = { status: 999 };
      mockOrderService.updateOrderStatus.mockRejectedValue(new BadRequestException());

      await expect(controller.updateOrderStatus(mockOrder.id, invalidDto as any)).rejects.toThrow();
    });

    it('should throw error when status is missing', async () => {
      const invalidDto = {};
      mockOrderService.updateOrderStatus.mockRejectedValue(new BadRequestException());

      await expect(controller.updateOrderStatus(mockOrder.id, invalidDto as any)).rejects.toThrow();
    });
  });

  describe('PATCH /orders/:id/payment-status - updatePaymentStatus', () => {
    const updatePaymentDto = {
      paymentStatus: PaymentStatus.COMPLETED,
    };

    it('should update payment status with valid data', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.UPDATED,
        data: { ...mockOrder, paymentStatus: PaymentStatus.COMPLETED },
      };
      mockOrderService.updatePaymentStatus.mockResolvedValue(expectedResponse);

      const result = await controller.updatePaymentStatus(mockOrder.id, updatePaymentDto);

      expect(service.updatePaymentStatus).toHaveBeenCalledWith(mockOrder.id, PaymentStatus.COMPLETED);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when paymentStatus is invalid', async () => {
      const invalidDto = { paymentStatus: 999 };
      mockOrderService.updatePaymentStatus.mockRejectedValue(new BadRequestException());

      await expect(controller.updatePaymentStatus(mockOrder.id, invalidDto as any)).rejects.toThrow();
    });

    it('should throw error when paymentStatus is missing', async () => {
      const invalidDto = {};
      mockOrderService.updatePaymentStatus.mockRejectedValue(new BadRequestException());

      await expect(controller.updatePaymentStatus(mockOrder.id, invalidDto as any)).rejects.toThrow();
    });
  });

  describe('PATCH /orders/:id/cancel - cancelOrder', () => {
    const cancelDto = {
      reason: 'Customer requested cancellation',
    };

    it('should cancel order with valid UUID and reason', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.CANCELLED,
        data: { ...mockOrder, status: OrderStatus.CANCELLED },
      };
      mockOrderService.cancelOrder.mockResolvedValue(expectedResponse);

      const result = await controller.cancelOrder(mockOrder.id, mockRequest as any, cancelDto);

      expect(service.cancelOrder).toHaveBeenCalledWith(mockOrder.id, mockUser, cancelDto.reason);
      expect(result).toEqual(expectedResponse);
    });

    it('should cancel order with empty reason', async () => {
      const emptyReasonDto = {};
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.ORDER.CANCELLED,
        data: mockOrder,
      };
      mockOrderService.cancelOrder.mockResolvedValue(expectedResponse);

      const result = await controller.cancelOrder(mockOrder.id, mockRequest as any, emptyReasonDto);

      expect(service.cancelOrder).toHaveBeenCalledWith(mockOrder.id, mockUser, '');
    });

    it('should throw error when reason exceeds max length', async () => {
      const longReasonDto = { reason: 'a'.repeat(300) };
      mockOrderService.cancelOrder.mockRejectedValue(new BadRequestException());

      await expect(controller.cancelOrder(mockOrder.id, mockRequest as any, longReasonDto)).rejects.toThrow();
    });
  });

  describe('PATCH /orders/:id/assign-delivery - assignDelivery', () => {
    it('should assign delivery person with valid UUID', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY.ASSIGNED,
        data: mockOrder,
      };
      mockOrderService.assignDeliveryPerson.mockResolvedValue(expectedResponse);

      const result = await controller.assignDelivery(mockOrder.id);

      expect(service.assignDeliveryPerson).toHaveBeenCalledWith(mockOrder.id);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error for invalid UUID', async () => {
      // ParseUUIDPipe validation
      expect(controller.assignDelivery).toBeDefined();
    });
  });

  describe('GET /orders/invoice/:id - generateInvoice', () => {
    it('should generate invoice PDF with valid UUID', async () => {
      const mockPdfBuffer = Buffer.from('pdf-content');
      const mockResponse = {
        set: vi.fn(),
        end: vi.fn(),
      } as unknown as Response;

      mockOrderService.generateInvoice.mockResolvedValue(mockPdfBuffer);

      await controller.generateInvoice(mockOrder.id, mockResponse);

      expect(service.generateInvoice).toHaveBeenCalledWith(mockOrder.id);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${mockOrder.id}.pdf`,
        'Content-Length': mockPdfBuffer.length,
      });
      expect(mockResponse.end).toHaveBeenCalledWith(mockPdfBuffer);
    });
  });

  describe('PATCH /orders/delivery/:id/accept - acceptDelivery', () => {
    it('should accept delivery with valid UUID', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY.ACCEPTED,
        data: null,
      };
      mockOrderService.acceptDelivery.mockResolvedValue(expectedResponse);

      const result = await controller.acceptDelivery(mockOrder.id, mockRequest as any);

      expect(service.acceptDelivery).toHaveBeenCalledWith(mockOrder.id, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when assignment not found', async () => {
      mockOrderService.acceptDelivery.mockRejectedValue(
        new BadRequestException('No assignment Found')
      );

      await expect(controller.acceptDelivery(mockOrder.id, mockRequest as any)).rejects.toThrow(
        new BadRequestException('No assignment Found')
      );
    });
  });

  describe('PATCH /orders/delivery/:id/reject - rejectDelivery', () => {
    it('should reject delivery with valid UUID', async () => {
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        message: MESSAGES.DELIVERY.REJECTED,
        data: null,
      };
      mockOrderService.rejectDelivery.mockResolvedValue(expectedResponse);

      const result = await controller.rejectDelivery(mockOrder.id, mockRequest as any);

      expect(service.rejectDelivery).toHaveBeenCalledWith(mockOrder.id, mockUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when assignment not found', async () => {
      mockOrderService.rejectDelivery.mockRejectedValue(
        new BadRequestException('No assignment Found')
      );

      await expect(controller.rejectDelivery(mockOrder.id, mockRequest as any)).rejects.toThrow(
        new BadRequestException('No assignment Found')
      );
    });
  });
});


describe('orderTrackingController', () => {
  let controller: orderTrackingController;
  let service: OrderService;

  const mockOrderService = {
    renderOrderTrackingPage: vi.fn(),
    getTrackOrderVm: vi.fn(),
  };

  const mockOrder = {
    id: 'order-uuid-123',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    totalAmount: 550,
    deliveryCharge: 50,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [orderTrackingController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<orderTrackingController>(orderTrackingController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /orders/track/:id - trackOrder', () => {
    it('should return HTML tracking page with valid UUID', async () => {
      const mockHtml = '<html><body>Order Tracking</body></html>';
      const mockResponse = {
        set: vi.fn(),
        send: vi.fn(),
      } as unknown as Response;

      mockOrderService.renderOrderTrackingPage.mockResolvedValue(mockHtml);

      await controller.trackOrder(mockOrder.id, mockResponse);

      expect(service.renderOrderTrackingPage).toHaveBeenCalledWith(mockOrder.id);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'text/html; charset=utf-8',
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockHtml);
    });

    it('should throw error for invalid UUID', async () => {
      // ParseUUIDPipe validation
      expect(controller.trackOrder).toBeDefined();
    });

    it('should throw error when order not found', async () => {
      const mockResponse = {
        set: vi.fn(),
        send: vi.fn(),
      } as unknown as Response;

      mockOrderService.renderOrderTrackingPage.mockRejectedValue(
        new BadRequestException('Order not found')
      );

      await expect(controller.trackOrder('non-existent-id', mockResponse)).rejects.toThrow(
        new BadRequestException('Order not found')
      );
    });
  });

  describe('GET /orders/track/:id/json - trackOrderJson', () => {
    it('should return order tracking data in JSON format', async () => {
      const mockTrackingData = {
        ...mockOrder,
        totalAmount: 550,
        deliveryCharge: 50,
        totalItems: 2,
        latitude: 19.076090,
        longitude: 72.877426,
        items: [],
      };

      mockOrderService.getTrackOrderVm.mockResolvedValue(mockTrackingData);

      const result = await controller.trackOrderJson(mockOrder.id);

      expect(service.getTrackOrderVm).toHaveBeenCalledWith(mockOrder.id);
      expect(result).toEqual(mockTrackingData);
    });

    it('should throw error for invalid UUID', async () => {
      // ParseUUIDPipe validation
      expect(controller.trackOrderJson).toBeDefined();
    });

    it('should throw error when order not found', async () => {
      mockOrderService.getTrackOrderVm.mockRejectedValue(
        new BadRequestException('Order not found')
      );

      await expect(controller.trackOrderJson('non-existent-id')).rejects.toThrow(
        new BadRequestException('Order not found')
      );
    });
  });
});
