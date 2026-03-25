import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentStatus } from '../common/enum/status.enum';
import { UserRole } from '../common/enum/roles.enum';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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
      await expect(paymentController.createPaymentIntent('', '123')).rejects.toThrow(
        'Failed to create payment intent: Amount and orderId are required as query parameters'
      );
    });

    it('should throw error when orderId is missing', async () => {
      await expect(paymentController.createPaymentIntent('100', '')).rejects.toThrow(
        'Failed to create payment intent: Amount and orderId are required as query parameters'
      );
    });

    it('should throw error when amount is invalid number', async () => {
      await expect(paymentController.createPaymentIntent('invalid', '123')).rejects.toThrow(
        'Failed to create payment intent: Amount and orderId must be valid numbers'
      );
    });

    it('should throw error when orderId is invalid number', async () => {
      await expect(paymentController.createPaymentIntent('100', 'invalid')).rejects.toThrow(
        'Failed to create payment intent: Amount and orderId must be valid numbers'
      );
    });

    it('should throw error when amount is zero or negative', async () => {
      await expect(paymentController.createPaymentIntent('0', '123')).rejects.toThrow(
        'Failed to create payment intent: Amount must be greater than 0'
      );

      await expect(paymentController.createPaymentIntent('-50', '123')).rejects.toThrow(
        'Failed to create payment intent: Amount must be greater than 0'
      );
    });

    it('should handle stripe service errors', async () => {
      mockStripeService.createPaymentIntent.mockRejectedValue(new Error('Stripe error'));

      await expect(paymentController.createPaymentIntent('100', '123')).rejects.toThrow(
        'Failed to create payment intent: Stripe error'
      );
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
    });

    it('should throw error when stripe signature is missing', async () => {
      const reqWithoutSignature = {
        headers: {},
        body: {},
      };

      await expect(paymentController.handleWebhook(reqWithoutSignature as any)).rejects.toThrow(
        'No stripe signature'
      );
    });

    it('should throw error when webhook secret is not set', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      await expect(paymentController.handleWebhook(mockReq as any)).rejects.toThrow(
        'STRIPE_WEBHOOK_SECRET environment variable is not set'
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
  });

  describe('verifyPaymentStatus', () => {
    it('should verify payment status', async () => {
      const dto: VerifyPaymentDto = { paymentIntentId: 'pi_test123' };
      const mockVerificationResult = { status: 'succeeded' };

      mockPaymentService.verifyPaymentStatus.mockResolvedValue(mockVerificationResult);

      const result = await paymentController.verifyPaymentStatus(dto);

      expect(paymentService.verifyPaymentStatus).toHaveBeenCalledWith('pi_test123');
      expect(result).toEqual(mockVerificationResult);
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments with filters', async () => {
      const query = {
        status: 'completed',
        orderId: '123',
        page: 1,
        limit: 10,
      };
      const mockPayments = {
        payments: [{ id: 1, amount: 100 }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPayments);
    });

    it('should return all payments without filters', async () => {
      const query = {};
      const mockPayments = {
        payments: [{ id: 1, amount: 100 }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockPaymentService.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentController.getAllPayments(query);

      expect(paymentService.getAllPayments).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPayments);
    });
  });
});
