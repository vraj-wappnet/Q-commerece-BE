import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
  const originalEnv = process.env.STRIPE_SECRET_KEY;

  beforeEach(async () => {
    // Set environment variable
    process.env.STRIPE_SECRET_KEY = 'sk_test_51234567890abcdefghijklmnopqrstuvwxyz';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original environment variable
    if (originalEnv) {
      process.env.STRIPE_SECRET_KEY = originalEnv;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Constructor', () => {
    it('should throw error if STRIPE_SECRET_KEY is not defined', () => {
      delete process.env.STRIPE_SECRET_KEY;
      
      expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY is not defined');
    });

    it('should throw error if STRIPE_SECRET_KEY is empty string', () => {
      process.env.STRIPE_SECRET_KEY = '';
      
      expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY is not defined');
    });

    it('should throw error if STRIPE_SECRET_KEY is undefined', () => {
      const originalKey = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      
      expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY is not defined');
      
      // Restore
      if (originalKey) process.env.STRIPE_SECRET_KEY = originalKey;
    });

    it('should initialize Stripe with secret key', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_valid_key';
      
      expect(() => new StripeService()).not.toThrow();
    });

    it('should create Stripe instance', () => {
      expect(service).toBeInstanceOf(StripeService);
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const amount = 100.50;
      const orderId = 123;
      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'pi_test123_secret_test123',
        amount: 10050,
        currency: 'inr',
        metadata: { orderId: '123' },
        status: 'requires_payment_method',
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

    it('should convert amount to smallest currency unit (paise)', async () => {
      const amount = 100;
      const orderId = 1;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000, // 100 * 100
        })
      );
    });

    it('should handle decimal amounts correctly', async () => {
      const amount = 99.99;
      const orderId = 456;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test456' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 9999, // Math.round(99.99 * 100)
        currency: 'inr',
        metadata: {
          orderId: '456',
        },
      });
    });

    it('should round amount correctly for edge cases', async () => {
      const amount = 99.995; // Should round to 9999.5 then to 10000
      const orderId = 789;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test789' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: Math.round(99.995 * 100), // 10000
        })
      );
    });

    it('should handle zero amount', async () => {
      const amount = 0;
      const orderId = 100;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test100' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 0,
        currency: 'inr',
        metadata: {
          orderId: '100',
        },
      });
    });

    it('should handle large amounts', async () => {
      const amount = 999999.99;
      const orderId = 200;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test200' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 99999999, // Math.round(999999.99 * 100)
        currency: 'inr',
        metadata: {
          orderId: '200',
        },
      });
    });

    it('should convert orderId to string in metadata', async () => {
      const amount = 50;
      const orderId = 12345;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            orderId: '12345',
          },
        })
      );
    });

    it('should use INR currency', async () => {
      const amount = 100;
      const orderId = 1;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'inr',
        })
      );
    });

    it('should handle Stripe API errors', async () => {
      const amount = 100;
      const orderId = 1;
      const error = new Error('Stripe API error');
      mockStripe.paymentIntents.create.mockRejectedValue(error);

      await expect(service.createPaymentIntent(amount, orderId)).rejects.toThrow('Stripe API error');
    });

    it('should handle network errors', async () => {
      const amount = 100;
      const orderId = 1;
      mockStripe.paymentIntents.create.mockRejectedValue(new Error('Network error'));

      await expect(service.createPaymentIntent(amount, orderId)).rejects.toThrow('Network error');
    });

    it('should return payment intent with client secret', async () => {
      const amount = 100;
      const orderId = 1;
      const mockPaymentIntent = {
        id: 'pi_test',
        client_secret: 'pi_test_secret_abc123',
        amount: 10000,
        currency: 'inr',
      };
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(amount, orderId);

      expect(result).toHaveProperty('client_secret');
      expect(result.client_secret).toBe('pi_test_secret_abc123');
    });

    it('should handle small decimal amounts', async () => {
      const amount = 0.01;
      const orderId = 1;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1, // Math.round(0.01 * 100)
        })
      );
    });

    it('should handle negative amounts (if passed)', async () => {
      const amount = -100;
      const orderId = 1;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -10000,
        })
      );
    });

    it('should handle floating point precision issues', async () => {
      const amount = 0.1 + 0.2; // 0.30000000000000004
      const orderId = 1;
      mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_test' });

      await service.createPaymentIntent(amount, orderId);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: Math.round((0.1 + 0.2) * 100), // 30
        })
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('should construct webhook event successfully', () => {
      const body = { type: 'payment_intent.succeeded', data: { object: {} } };
      const signature = 'whsec_test_signature_abc123';
      const webhookSecret = 'whsec_test_secret_xyz789';
      const mockEvent = {
        id: 'evt_test123',
        type: 'payment_intent.succeeded',
        data: { object: {} },
        created: 1234567890,
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = service.constructWebhookEvent(body, signature, webhookSecret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(body, signature, webhookSecret);
      expect(result).toEqual(mockEvent);
    });

    it('should pass all parameters to Stripe webhook constructor', () => {
      const body = { type: 'charge.succeeded' };
      const signature = 'sig_123';
      const webhookSecret = 'secret_456';
      mockStripe.webhooks.constructEvent.mockReturnValue({ type: 'charge.succeeded' });

      service.constructWebhookEvent(body, signature, webhookSecret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(body, signature, webhookSecret);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid signature error', () => {
      const body = { type: 'payment_intent.succeeded' };
      const signature = 'invalid_signature';
      const webhookSecret = 'whsec_secret';
      const error = new Error('Invalid signature');
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw error;
      });

      expect(() => service.constructWebhookEvent(body, signature, webhookSecret)).toThrow('Invalid signature');
    });

    it('should handle different event types', () => {
      const eventTypes = [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'charge.succeeded',
        'charge.failed',
        'customer.created',
      ];

      eventTypes.forEach(eventType => {
        const body = { type: eventType };
        const signature = 'sig_test';
        const webhookSecret = 'secret_test';
        mockStripe.webhooks.constructEvent.mockReturnValue({ type: eventType });

        const result = service.constructWebhookEvent(body, signature, webhookSecret);

        expect(result.type).toBe(eventType);
      });
    });

    it('should handle empty body', () => {
      const body = {};
      const signature = 'sig_test';
      const webhookSecret = 'secret_test';
      mockStripe.webhooks.constructEvent.mockReturnValue({ type: 'unknown' });

      const result = service.constructWebhookEvent(body, signature, webhookSecret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(body, signature, webhookSecret);
      expect(result).toBeDefined();
    });

    it('should return event with correct structure', () => {
      const body = { type: 'payment_intent.succeeded' };
      const signature = 'sig_test';
      const webhookSecret = 'secret_test';
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
        created: Date.now(),
      };
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = service.constructWebhookEvent(body, signature, webhookSecret);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('created');
    });

    it('should handle webhook secret validation', () => {
      const body = { type: 'payment_intent.succeeded' };
      const signature = 'sig_test';
      const webhookSecret = 'whsec_correct_secret';
      mockStripe.webhooks.constructEvent.mockReturnValue({ type: 'payment_intent.succeeded' });

      expect(() => service.constructWebhookEvent(body, signature, webhookSecret)).not.toThrow();
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should retrieve payment intent successfully', async () => {
      const paymentIntentId = 'pi_test123';
      const mockPaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
        currency: 'inr',
        metadata: { orderId: '123' },
        created: 1234567890,
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.retrievePaymentIntent(paymentIntentId);

      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(paymentIntentId);
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should pass correct payment intent ID', async () => {
      const paymentIntentId = 'pi_abc123xyz789';
      mockStripe.paymentIntents.retrieve.mockResolvedValue({ id: paymentIntentId });

      await service.retrievePaymentIntent(paymentIntentId);

      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(paymentIntentId);
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledTimes(1);
    });

    it('should handle different payment intent statuses', async () => {
      const statuses = ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled'];

      for (const status of statuses) {
        const paymentIntentId = `pi_${status}`;
        mockStripe.paymentIntents.retrieve.mockResolvedValue({
          id: paymentIntentId,
          status,
        });

        const result = await service.retrievePaymentIntent(paymentIntentId);

        expect(result.status).toBe(status);
      }
    });

    it('should handle payment intent not found error', async () => {
      const paymentIntentId = 'pi_nonexistent';
      const error = new Error('No such payment_intent');
      mockStripe.paymentIntents.retrieve.mockRejectedValue(error);

      await expect(service.retrievePaymentIntent(paymentIntentId)).rejects.toThrow('No such payment_intent');
    });

    it('should return payment intent with all properties', async () => {
      const paymentIntentId = 'pi_test';
      const mockPaymentIntent = {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: 10000,
        currency: 'inr',
        status: 'succeeded',
        metadata: { orderId: '123' },
        created: 1234567890,
        client_secret: 'pi_test_secret',
      };
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.retrievePaymentIntent(paymentIntentId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('metadata');
    });

    it('should handle Stripe API errors', async () => {
      const paymentIntentId = 'pi_test';
      mockStripe.paymentIntents.retrieve.mockRejectedValue(new Error('API error'));

      await expect(service.retrievePaymentIntent(paymentIntentId)).rejects.toThrow('API error');
    });

    it('should handle network errors', async () => {
      const paymentIntentId = 'pi_test';
      mockStripe.paymentIntents.retrieve.mockRejectedValue(new Error('Network timeout'));

      await expect(service.retrievePaymentIntent(paymentIntentId)).rejects.toThrow('Network timeout');
    });

    it('should retrieve payment intent with metadata', async () => {
      const paymentIntentId = 'pi_test';
      const mockPaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        metadata: {
          orderId: '12345',
          customField: 'value',
        },
      };
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.retrievePaymentIntent(paymentIntentId);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.orderId).toBe('12345');
    });

    it('should handle empty payment intent ID', async () => {
      const paymentIntentId = '';
      mockStripe.paymentIntents.retrieve.mockRejectedValue(new Error('Invalid payment intent ID'));

      await expect(service.retrievePaymentIntent(paymentIntentId)).rejects.toThrow();
    });
  });

  describe('Service Instance', () => {
    it('should be an instance of StripeService', () => {
      expect(service).toBeInstanceOf(StripeService);
    });

    it('should have createPaymentIntent method', () => {
      expect(service.createPaymentIntent).toBeDefined();
      expect(typeof service.createPaymentIntent).toBe('function');
    });

    it('should have constructWebhookEvent method', () => {
      expect(service.constructWebhookEvent).toBeDefined();
      expect(typeof service.constructWebhookEvent).toBe('function');
    });

    it('should have retrievePaymentIntent method', () => {
      expect(service.retrievePaymentIntent).toBeDefined();
      expect(typeof service.retrievePaymentIntent).toBe('function');
    });

    it('should have private stripe instance', () => {
      expect((service as any).stripe).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should create and retrieve payment intent', async () => {
      const amount = 100;
      const orderId = 1;
      const mockPaymentIntent = {
        id: 'pi_test123',
        amount: 10000,
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        ...mockPaymentIntent,
        status: 'succeeded',
      });

      const created = await service.createPaymentIntent(amount, orderId);
      const retrieved = await service.retrievePaymentIntent(created.id);

      expect(created.id).toBe(retrieved.id);
    });

    it('should handle multiple payment intents', async () => {
      const amounts = [100, 200, 300];
      const orderIds = [1, 2, 3];

      for (let i = 0; i < amounts.length; i++) {
        mockStripe.paymentIntents.create.mockResolvedValue({
          id: `pi_test${i}`,
          amount: amounts[i] * 100,
        });

        const result = await service.createPaymentIntent(amounts[i], orderIds[i]);
        expect(result.amount).toBe(amounts[i] * 100);
      }

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(3);
    });
  });
});
