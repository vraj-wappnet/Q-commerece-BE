import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { PaymentStatus } from 'src/common/enum/status.enum';
import { UserRole } from 'src/common/enum/roles.enum';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let paymentService: PaymentService;
  let stripeService: StripeService;

  const mockPaymentService = {
    createPaymentTransaction: vi.fn(),
    updatePaymentStatus: vi.fn(),
    getPaymentByOrderId: vi.fn(),
    getPaymentByIntentId: vi.fn(),
    verifyPaymentStatus: vi.fn(),
    getAllPayments: vi.fn(),
  };

  const mockStripeService = {
    createPaymentIntent: vi.fn(),
    constructWebhookEvent: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    paymentController = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    stripeService = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const amount = '100.50';
      const orderId = '123';
      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'pi_test123_secret_test123',
      };

      mockStripeService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);
      mockPaymentService.createPaymentTransaction.mockResolvedValue({});

      const result = await paymentController.createPaymentIntent(amount, orderId);

      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(100.50, 123);
      expect(paymentService.createPaymentTransaction).toHaveBeenCalledWith({
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100.50,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      });
      expect(result).toEqual({
        clientSecret: 'pi_test123_secret_test123',
        paymentIntentId: 'pi_test123',
      });
    });

    it('should throw error when amount is missing', async () => {
      try {
        await paymentController.createPaymentIntent('', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId are required as query parameters');
      }
    });

    it('should throw error when orderId is missing', async () => {
      try {
        await paymentController.createPaymentIntent('100', '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId are required as query parameters');
      }
    });

    it('should throw error when both amount and orderId are missing', async () => {
      try {
        await paymentController.createPaymentIntent('', '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId are required as query parameters');
      }
    });

    it('should throw error when amount is invalid number', async () => {
      try {
        await paymentController.createPaymentIntent('invalid', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId must be valid numbers');
      }
    });

    it('should throw error when orderId is invalid number', async () => {
      try {
        await paymentController.createPaymentIntent('100', 'invalid');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId must be valid numbers');
      }
    });

    it('should throw error when amount is zero', async () => {
      try {
        await paymentController.createPaymentIntent('0', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount must be greater than 0');
      }
    });

    it('should throw error when amount is negative', async () => {
      try {
        await paymentController.createPaymentIntent('-50', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount must be greater than 0');
      }
    });

    it('should handle stripe service errors', async () => {
      mockStripeService.createPaymentIntent.mockRejectedValue(new Error('Stripe error'));

      try {
        await paymentController.createPaymentIntent('100', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Failed to create payment intent: Stripe error');
      }
    });

    it('should handle payment service errors', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'pi_test123_secret_test123',
      };

      mockStripeService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);
      mockPaymentService.createPaymentTransaction.mockRejectedValue(new Error('Database error'));

      try {
        await paymentController.createPaymentIntent('100', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Failed to create payment intent: Database error');
      }
    });

    it('should handle decimal amounts correctly', async () => {
      const amount = '99.99';
      const orderId = '456';
      const mockPaymentIntent = {
        id: 'pi_test456',
        client_secret: 'pi_test456_secret_test456',
      };

      mockStripeService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);
      mockPaymentService.createPaymentTransaction.mockResolvedValue({});

      await paymentController.createPaymentIntent(amount, orderId);

      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(99.99, 456);
    });

    it('should handle large amounts', async () => {
      const amount = '999999.99';
      const orderId = '789';
      const mockPaymentIntent = {
        id: 'pi_test789',
        client_secret: 'pi_test789_secret_test789',
      };

      mockStripeService.createPaymentIntent.mockResolvedValue(mockPaymentIntent);
      mockPaymentService.createPaymentTransaction.mockResolvedValue({});

      await paymentController.createPaymentIntent(amount, orderId);

      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(999999.99, 789);
    });

    it('should handle whitespace in amount', async () => {
      try {
        await paymentController.createPaymentIntent('  ', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId must be valid numbers');
      }
    });

    it('should handle whitespace in orderId', async () => {
      try {
        await paymentController.createPaymentIntent('100', '  ');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId must be valid numbers');
      }
    });

    it('should handle NaN amount', async () => {
      try {
        await paymentController.createPaymentIntent('abc123', '123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId must be valid numbers');
      }
    });

    it('should handle NaN orderId', async () => {
      try {
        await paymentController.createPaymentIntent('100', 'abc123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Amount and orderId must be valid numbers');
      }
    });
  });

  describe('handleWebhook', () => {
    const mockReq = {
      headers: { 'stripe-signature': 'test_signature' },
      body: { type: 'payment_intent.succeeded' },
    };

    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
    });

    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            metadata: { orderId: '123' },
            payment_method_types: ['card'],
          },
        },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPaymentService.updatePaymentStatus.mockResolvedValue({});

      const result = await paymentController.handleWebhook(mockReq as any);

      expect(stripeService.constructWebhookEvent).toHaveBeenCalledWith(
        mockReq.body,
        'test_signature',
        'test_webhook_secret'
      );
      expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test123',
        PaymentStatus.COMPLETED,
        {
          paymentMethod: 'card',
          stripeResponse: mockEvent.data.object,
        }
      );
      expect(result).toEqual({ received: true, orderConfirmed: true });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test123',
            last_payment_error: { message: 'Card declined' },
          },
        },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPaymentService.updatePaymentStatus.mockResolvedValue({});

      const result = await paymentController.handleWebhook(mockReq as any);

      expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test123',
        PaymentStatus.FAILED,
        {
          failureReason: 'Card declined',
          stripeResponse: mockEvent.data.object,
        }
      );
      expect(result).toEqual({ received: true });
    });

    it('should handle other event types', async () => {
      const mockEvent = {
        type: 'other.event',
        data: { object: {} },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const result = await paymentController.handleWebhook(mockReq as any);

      expect(result).toEqual({ received: true });
      expect(paymentService.updatePaymentStatus).not.toHaveBeenCalled();
    });

    it('should throw error when stripe signature is missing', async () => {
      const reqWithoutSignature = {
        headers: {},
        body: {},
      };

      try {
        await paymentController.handleWebhook(reqWithoutSignature as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('No stripe signature');
      }
    });

    it('should throw error when webhook secret is not set', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      try {
        await paymentController.handleWebhook(mockReq as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('STRIPE_WEBHOOK_SECRET environment variable is not set');
      }
    });

    it('should handle payment_intent.succeeded with missing payment_method_types', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            metadata: { orderId: '123' },
          },
        },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPaymentService.updatePaymentStatus.mockResolvedValue({});

      const result = await paymentController.handleWebhook(mockReq as any);

      expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test123',
        PaymentStatus.COMPLETED,
        {
          paymentMethod: undefined,
          stripeResponse: mockEvent.data.object,
        }
      );
      expect(result).toEqual({ received: true, orderConfirmed: true });
    });

    it('should handle payment_intent.payment_failed with missing error message', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test123',
          },
        },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPaymentService.updatePaymentStatus.mockResolvedValue({});

      const result = await paymentController.handleWebhook(mockReq as any);

      expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test123',
        PaymentStatus.FAILED,
        {
          failureReason: undefined,
          stripeResponse: mockEvent.data.object,
        }
      );
      expect(result).toEqual({ received: true });
    });

    it('should handle webhook event construction errors', async () => {
      mockStripeService.constructWebhookEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(paymentController.handleWebhook(mockReq as any)).rejects.toThrow('Invalid signature');
    });

    it('should handle payment service errors during webhook processing', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            metadata: { orderId: '123' },
            payment_method_types: ['card'],
          },
        },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPaymentService.updatePaymentStatus.mockRejectedValue(new Error('Database error'));

      await expect(paymentController.handleWebhook(mockReq as any)).rejects.toThrow('Database error');
    });

    it('should handle empty stripe signature', async () => {
      const reqWithEmptySignature = {
        headers: { 'stripe-signature': '' },
        body: {},
      };

      try {
        await paymentController.handleWebhook(reqWithEmptySignature as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('No stripe signature');
      }
    });

    it('should handle different payment methods in succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            metadata: { orderId: '123' },
            payment_method_types: ['upi'],
          },
        },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPaymentService.updatePaymentStatus.mockResolvedValue({});

      await paymentController.handleWebhook(mockReq as any);

      expect(paymentService.updatePaymentStatus).toHaveBeenCalledWith(
        'pi_test123',
        PaymentStatus.COMPLETED,
        {
          paymentMethod: 'upi',
          stripeResponse: mockEvent.data.object,
        }
      );
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should return payment by order ID', async () => {
      const orderId = '123';
      const mockPayment = { id: 1, orderId: '123', amount: 100 };

      mockPaymentService.getPaymentByOrderId.mockResolvedValue(mockPayment);

      const result = await paymentController.getPaymentByOrderId(orderId);

      expect(paymentService.getPaymentByOrderId).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockPayment);
    });

    it('should handle service errors', async () => {
      const orderId = '123';

      mockPaymentService.getPaymentByOrderId.mockRejectedValue(new Error('Payment not found'));

      await expect(paymentController.getPaymentByOrderId(orderId)).rejects.toThrow('Payment not found');
    });

    it('should handle different order IDs', async () => {
      const orderIds = ['123', '456', '789'];

      for (const orderId of orderIds) {
        const mockPayment = { id: 1, orderId, amount: 100 };
        mockPaymentService.getPaymentByOrderId.mockResolvedValue(mockPayment);

        const result = await paymentController.getPaymentByOrderId(orderId);

        expect(result.orderId).toBe(orderId);
      }
    });

    it('should return payment with order relations', async () => {
      const orderId = '123';
      const mockPayment = {
        id: 1,
        orderId: '123',
        amount: 100,
        order: { id: '123', total: 100 },
      };

      mockPaymentService.getPaymentByOrderId.mockResolvedValue(mockPayment);

      const result = await paymentController.getPaymentByOrderId(orderId);

      expect(result).toHaveProperty('order');
    });
  });

  describe('getPaymentByIntentId', () => {
    it('should return payment by intent ID', async () => {
      const paymentIntentId = 'pi_test123';
      const mockPayment = { id: 1, paymentIntentId: 'pi_test123', amount: 100 };

      mockPaymentService.getPaymentByIntentId.mockResolvedValue(mockPayment);

      const result = await paymentController.getPaymentByIntentId(paymentIntentId);

      expect(paymentService.getPaymentByIntentId).toHaveBeenCalledWith(paymentIntentId);
      expect(result).toEqual(mockPayment);
    });

    it('should handle service errors', async () => {
      const paymentIntentId = 'pi_test123';

      mockPaymentService.getPaymentByIntentId.mockRejectedValue(new Error('Payment not found'));

      await expect(paymentController.getPaymentByIntentId(paymentIntentId)).rejects.toThrow('Payment not found');
    });

    it('should handle different payment intent IDs', async () => {
      const intentIds = ['pi_test123', 'pi_test456', 'pi_test789'];

      for (const intentId of intentIds) {
        const mockPayment = { id: 1, paymentIntentId: intentId, amount: 100 };
        mockPaymentService.getPaymentByIntentId.mockResolvedValue(mockPayment);

        const result = await paymentController.getPaymentByIntentId(intentId);

        expect(result.paymentIntentId).toBe(intentId);
      }
    });

    it('should return payment with order relations', async () => {
      const paymentIntentId = 'pi_test123';
      const mockPayment = {
        id: 1,
        paymentIntentId: 'pi_test123',
        amount: 100,
        order: { id: '123', total: 100 },
      };

      mockPaymentService.getPaymentByIntentId.mockResolvedValue(mockPayment);

      const result = await paymentController.getPaymentByIntentId(paymentIntentId);

      expect(result).toHaveProperty('order');
    });
  });

  describe('verifyPaymentStatus', () => {
    it('should verify payment status', async () => {
      const dto: VerifyPaymentDto = { paymentIntentId: 'pi_test123' };
      const mockVerificationResult = {
        verified: true,
        status: 'succeeded',
        amount: 100,
        currency: 'inr',
        paymentMethod: 'card',
      };

      mockPaymentService.verifyPaymentStatus.mockResolvedValue(mockVerificationResult);

      const result = await paymentController.verifyPaymentStatus(dto);

      expect(paymentService.verifyPaymentStatus).toHaveBeenCalledWith('pi_test123');
      expect(result).toEqual(mockVerificationResult);
    });

    it('should handle service errors', async () => {
      const dto: VerifyPaymentDto = { paymentIntentId: 'pi_test123' };

      mockPaymentService.verifyPaymentStatus.mockRejectedValue(new Error('Verification failed'));

      await expect(paymentController.verifyPaymentStatus(dto)).rejects.toThrow('Verification failed');
    });

    it('should handle different payment statuses', async () => {
      const dto: VerifyPaymentDto = { paymentIntentId: 'pi_test123' };
      const statuses = ['succeeded', 'failed', 'pending', 'processing'];

      for (const status of statuses) {
        const mockResult = {
          verified: true,
          status,
          amount: 100,
          currency: 'inr',
        };
        mockPaymentService.verifyPaymentStatus.mockResolvedValue(mockResult);

        const result = await paymentController.verifyPaymentStatus(dto);

        expect(result.status).toBe(status);
      }
    });

    it('should handle verification with different payment methods', async () => {
      const dto: VerifyPaymentDto = { paymentIntentId: 'pi_test123' };
      const mockResult = {
        verified: true,
        status: 'succeeded',
        amount: 100,
        currency: 'inr',
        paymentMethod: 'upi',
      };

      mockPaymentService.verifyPaymentStatus.mockResolvedValue(mockResult);

      const result = await paymentController.verifyPaymentStatus(dto);

      expect(result.paymentMethod).toBe('upi');
    });

    it('should handle verification without payment method', async () => {
      const dto: VerifyPaymentDto = { paymentIntentId: 'pi_test123' };
      const mockResult = {
        verified: true,
        status: 'succeeded',
        amount: 100,
        currency: 'inr',
      };

      mockPaymentService.verifyPaymentStatus.mockResolvedValue(mockResult);

      const result = await paymentController.verifyPaymentStatus(dto);

      expect(result).not.toHaveProperty('paymentMethod');
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments with filters', async () => {
      const query = {
        status: '3',
        orderId: '123',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: '1',
        limit: '10',
      };
      const mockPayments = {
        data: [{ id: 1, amount: 100 }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPayments);
    });

    it('should return all payments without filters', async () => {
      const query = {};
      const mockPayments = {
        data: [{ id: 1, amount: 100 }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPayments);
    });

    it('should handle service errors', async () => {
      const query = {};

      mockPaymentService.getAllPayments.mockRejectedValue(new Error('Database error'));

      await expect(paymentController.getAllPayments(query)).rejects.toThrow('Database error');
    });

    it('should filter by status only', async () => {
      const query = { status: '1' };
      const mockPayments = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
    });

    it('should filter by orderId only', async () => {
      const query = { orderId: '456' };
      const mockPayments = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
    });

    it('should filter by date range only', async () => {
      const query = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };
      const mockPayments = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
    });

    it('should handle pagination parameters', async () => {
      const query = {
        page: '2',
        limit: '20',
      };
      const mockPayments = {
        data: [],
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentController.getAllPayments(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should handle empty results', async () => {
      const query = {};
      const mockPayments = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentController.getAllPayments(query);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle multiple payment statuses', async () => {
      const statuses = ['1', '2', '3', '4', '5'];

      for (const status of statuses) {
        const query = { status };
        const mockPayments = {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        };

        mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

        await paymentController.getAllPayments(query);

        expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
      }
    });

    it('should handle large page numbers', async () => {
      const query = {
        page: '100',
        limit: '10',
      };
      const mockPayments = {
        data: [],
        total: 0,
        page: 100,
        limit: 10,
        totalPages: 0,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
    });

    it('should handle combined filters', async () => {
      const query = {
        status: '3',
        orderId: '123',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: '1',
        limit: '10',
      };
      const mockPayments = {
        data: [{ id: 1, amount: 100 }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
    });
  });
});
