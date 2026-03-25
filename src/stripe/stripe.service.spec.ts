import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Stripe
const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

// Mock the Stripe constructor
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      constructor() {
        return mockStripe;
      }
    }
  };
});

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    // Set environment variable
    process.env.STRIPE_SECRET_KEY = 'test_secret_key';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
    
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if STRIPE_SECRET_KEY is not defined', () => {
    delete process.env.STRIPE_SECRET_KEY;
    
    expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY is not defined');
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const amount = 100.50;
      const orderId = 123;
      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'pi_test123_secret_test123',
        amount: 10050, // amount * 100
        currency: 'inr',
        metadata: { orderId: '123' },
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: Math.round(amount * 100),
        currency: 'inr',
        metadata: {
          orderId: orderId.toString(),
        },
      });
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle decimal amounts correctly', async () => {
      const amount = 99.99;
      const orderId = 456;
      const mockPaymentIntent = {
        id: 'pi_test456',
        amount: 9999, // Math.round(99.99 * 100)
        currency: 'inr',
        metadata: { orderId: '456' },
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 9999,
        currency: 'inr',
        metadata: {
          orderId: '456',
        },
      });
    });
  });

  describe('constructWebhookEvent', () => {
    it('should construct webhook event successfully', () => {
      const body = { type: 'payment_intent.succeeded' };
      const signature = 'test_signature';
      const webhookSecret = 'test_webhook_secret';
      const mockEvent = { type: 'payment_intent.succeeded', data: {} };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = service.constructWebhookEvent(body, signature, webhookSecret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(body, signature, webhookSecret);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should retrieve payment intent successfully', async () => {
      const paymentIntentId = 'pi_test123';
      const mockPaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.retrievePaymentIntent(paymentIntentId);

      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(paymentIntentId);
      expect(result).toEqual(mockPaymentIntent);
    });
  });
});
