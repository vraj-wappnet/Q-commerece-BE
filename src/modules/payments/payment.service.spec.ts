import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentTransaction } from './entity/payment-transaction.entity';
import { PaymentStatus } from 'src/common/enum/status.enum';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: Repository<PaymentTransaction>;
  let stripeService: StripeService;

  const mockPaymentRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockStripeService = {
    retrievePaymentIntent: vi.fn(),
  };

  const mockPaymentTransaction: PaymentTransaction = {
    id: 1,
    orderId: '123',
    paymentIntentId: 'pi_test123',
    amount: 100,
    currency: 'INR',
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(PaymentTransaction),
          useValue: mockPaymentRepo,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepo = module.get<Repository<PaymentTransaction>>(getRepositoryToken(PaymentTransaction));
    stripeService = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentTransaction', () => {
    it('should create payment transaction successfully', async () => {
      const data = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      };

      mockPaymentRepo.create.mockReturnValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue(mockPaymentTransaction);

      const result = await service.createPaymentTransaction(data);

      expect(paymentRepo.create).toHaveBeenCalledWith({
        orderId: data.orderId,
        paymentIntentId: data.paymentIntentId,
        amount: Number(data.amount.toFixed(2)),
        currency: data.currency || 'INR',
        status: data.status || PaymentStatus.PENDING,
      });
      expect(paymentRepo.save).toHaveBeenCalledWith(mockPaymentTransaction);
      expect(result).toEqual(mockPaymentTransaction);
    });

    it('should use default values when not provided', async () => {
      const data = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100,
      };

      const expectedData = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100.00,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      };

      mockPaymentRepo.create.mockReturnValue(expectedData);
      mockPaymentRepo.save.mockResolvedValue(expectedData);

      await service.createPaymentTransaction(data);

      expect(paymentRepo.create).toHaveBeenCalledWith(expectedData);
    });

    it('should format amount to 2 decimal places', async () => {
      const data = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100.999,
      };

      mockPaymentRepo.create.mockReturnValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue(mockPaymentTransaction);

      await service.createPaymentTransaction(data);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 101.00,
        })
      );
    });

    it('should handle different currencies', async () => {
      const data = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100,
        currency: 'USD',
      };

      mockPaymentRepo.create.mockReturnValue({ ...mockPaymentTransaction, currency: 'USD' });
      mockPaymentRepo.save.mockResolvedValue({ ...mockPaymentTransaction, currency: 'USD' });

      const result = await service.createPaymentTransaction(data);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
        })
      );
      expect(result.currency).toBe('USD');
    });

    it('should handle different payment statuses', async () => {
      const data = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100,
        status: PaymentStatus.COMPLETED,
      };

      mockPaymentRepo.create.mockReturnValue({ ...mockPaymentTransaction, status: PaymentStatus.COMPLETED });
      mockPaymentRepo.save.mockResolvedValue({ ...mockPaymentTransaction, status: PaymentStatus.COMPLETED });

      const result = await service.createPaymentTransaction(data);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.COMPLETED,
        })
      );
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should handle database errors', async () => {
      const data = {
        orderId: '123',
        paymentIntentId: 'pi_test123',
        amount: 100,
      };

      mockPaymentRepo.create.mockReturnValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createPaymentTransaction(data)).rejects.toThrow('Database error');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const paymentIntentId = 'pi_test123';
      const status = PaymentStatus.COMPLETED;
      const additionalData = {
        paymentMethod: 'card',
        stripeResponse: { id: 'pi_test123' },
      };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status,
        ...additionalData,
      });

      const result = await service.updatePaymentStatus(paymentIntentId, status, additionalData);

      expect(paymentRepo.findOne).toHaveBeenCalledWith({
        where: { paymentIntentId },
      });
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status,
          paymentMethod: 'card',
          stripeResponse: { id: 'pi_test123' },
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          status,
          paymentMethod: 'card',
          stripeResponse: { id: 'pi_test123' },
        })
      );
    });

    it('should throw NotFoundException if payment transaction not found', async () => {
      const paymentIntentId = 'nonexistent_payment';

      mockPaymentRepo.findOne.mockResolvedValue(null);

      try {
        await service.updatePaymentStatus(paymentIntentId, PaymentStatus.COMPLETED);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Payment transaction not found');
      }
    });

    it('should update status without additional data', async () => {
      const paymentIntentId = 'pi_test123';
      const status = PaymentStatus.FAILED;

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status,
      });

      await service.updatePaymentStatus(paymentIntentId, status);

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status,
        })
      );
    });

    it('should update only paymentMethod when provided', async () => {
      const paymentIntentId = 'pi_test123';
      const status = PaymentStatus.COMPLETED;
      const additionalData = { paymentMethod: 'card' };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status,
        paymentMethod: 'card',
      });

      const result = await service.updatePaymentStatus(paymentIntentId, status, additionalData);

      expect(result).toEqual(
        expect.objectContaining({
          paymentMethod: 'card',
        })
      );
    });

    it('should update only paymentMethodId when provided', async () => {
      const paymentIntentId = 'pi_test123';
      const status = PaymentStatus.COMPLETED;
      const additionalData = { paymentMethodId: 'pm_test123' };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status,
        paymentMethodId: 'pm_test123',
      });

      const result = await service.updatePaymentStatus(paymentIntentId, status, additionalData);

      expect(result).toEqual(
        expect.objectContaining({
          paymentMethodId: 'pm_test123',
        })
      );
    });

    it('should update only failureReason when provided', async () => {
      const paymentIntentId = 'pi_test123';
      const status = PaymentStatus.FAILED;
      const additionalData = { failureReason: 'Card declined' };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status,
        failureReason: 'Card declined',
      });

      const result = await service.updatePaymentStatus(paymentIntentId, status, additionalData);

      expect(result).toEqual(
        expect.objectContaining({
          failureReason: 'Card declined',
        })
      );
    });

    it('should update transactionDate when updating status', async () => {
      const paymentIntentId = 'pi_test123';
      const status = PaymentStatus.COMPLETED;

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status,
        transactionDate: new Date(),
      });

      await service.updatePaymentStatus(paymentIntentId, status);

      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionDate: expect.any(Date),
        })
      );
    });

    it('should handle all payment statuses', async () => {
      const paymentIntentId = 'pi_test123';
      const statuses = [
        PaymentStatus.PENDING,
        PaymentStatus.PROCESSING,
        PaymentStatus.COMPLETED,
        PaymentStatus.FAILED,
        PaymentStatus.REFUNDED,
      ];

      for (const status of statuses) {
        mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
        mockPaymentRepo.save.mockResolvedValue({
          ...mockPaymentTransaction,
          status,
        });

        const result = await service.updatePaymentStatus(paymentIntentId, status);
        expect(result.status).toBe(status);
      }
    });

    it('should handle database errors during update', async () => {
      const paymentIntentId = 'pi_test123';

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockPaymentRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(service.updatePaymentStatus(paymentIntentId, PaymentStatus.COMPLETED))
        .rejects.toThrow('Database error');
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should get payment by order ID', async () => {
      const orderId = '123';

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);

      const result = await service.getPaymentByOrderId(orderId);

      expect(paymentRepo.findOne).toHaveBeenCalledWith({
        where: { orderId },
        relations: ['order'],
      });
      expect(result).toEqual(mockPaymentTransaction);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const orderId = 'nonexistent_order';

      mockPaymentRepo.findOne.mockResolvedValue(null);

      try {
        await service.getPaymentByOrderId(orderId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Payment transaction not found for this order');
      }
    });

    it('should include order relations', async () => {
      const orderId = '123';

      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPaymentTransaction,
        order: { id: '123', total: 100 },
      });

      const result = await service.getPaymentByOrderId(orderId);

      expect(result).toHaveProperty('order');
      expect(paymentRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['order'],
        })
      );
    });

    it('should handle database errors', async () => {
      const orderId = '123';

      mockPaymentRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getPaymentByOrderId(orderId)).rejects.toThrow('Database error');
    });
  });

  describe('getPaymentByIntentId', () => {
    it('should get payment by payment intent ID', async () => {
      const paymentIntentId = 'pi_test123';

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);

      const result = await service.getPaymentByIntentId(paymentIntentId);

      expect(paymentRepo.findOne).toHaveBeenCalledWith({
        where: { paymentIntentId },
        relations: ['order'],
      });
      expect(result).toEqual(mockPaymentTransaction);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const paymentIntentId = 'nonexistent_intent';

      mockPaymentRepo.findOne.mockResolvedValue(null);

      try {
        await service.getPaymentByIntentId(paymentIntentId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Payment transaction not found');
      }
    });

    it('should include order relations', async () => {
      const paymentIntentId = 'pi_test123';

      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPaymentTransaction,
        order: { id: '123', total: 100 },
      });

      const result = await service.getPaymentByIntentId(paymentIntentId);

      expect(result).toHaveProperty('order');
      expect(paymentRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['order'],
        })
      );
    });

    it('should handle database errors', async () => {
      const paymentIntentId = 'pi_test123';

      mockPaymentRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getPaymentByIntentId(paymentIntentId)).rejects.toThrow('Database error');
    });
  });

  describe('verifyPaymentStatus', () => {
    it('should verify payment status with Stripe', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
        currency: 'inr',
        payment_method_types: ['card'],
      };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);
      mockPaymentRepo.save.mockResolvedValue(mockPaymentTransaction);

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(paymentRepo.findOne).toHaveBeenCalledWith({
        where: { paymentIntentId },
        relations: ['order'],
      });
      expect(stripeService.retrievePaymentIntent).toHaveBeenCalledWith(paymentIntentId);
      expect(result).toEqual({
        verified: true,
        status: 'succeeded',
        amount: 100,
        currency: 'inr',
        paymentMethod: 'card',
      });
    });

    it('should handle Stripe API errors', async () => {
      const paymentIntentId = 'pi_test123';
      const error = new Error('Stripe API error');

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockRejectedValue(error);

      await expect(service.verifyPaymentStatus(paymentIntentId))
        .rejects.toThrow('Failed to verify payment: Stripe API error');
    });
  });

  describe('verifyPaymentStatus', () => {
    it('should verify payment status with Stripe and update to COMPLETED', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
        currency: 'inr',
        payment_method_types: ['card'],
      };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status: PaymentStatus.COMPLETED,
      });

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(paymentRepo.findOne).toHaveBeenCalledWith({
        where: { paymentIntentId },
        relations: ['order'],
      });
      expect(stripeService.retrievePaymentIntent).toHaveBeenCalledWith(paymentIntentId);
      expect(result).toEqual({
        verified: true,
        status: 'succeeded',
        amount: 100,
        currency: 'inr',
        paymentMethod: 'card',
      });
    });

    it('should verify payment status and update to FAILED', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'failed',
        amount: 10000,
        currency: 'inr',
        payment_method_types: ['card'],
        last_payment_error: { message: 'Card declined' },
      };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);
      mockPaymentRepo.save.mockResolvedValue({
        ...mockPaymentTransaction,
        status: PaymentStatus.FAILED,
      });

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(result).toEqual({
        verified: true,
        status: 'failed',
        amount: 100,
        currency: 'inr',
        paymentMethod: 'card',
      });
    });

    it('should not update status if already COMPLETED', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
        currency: 'inr',
        payment_method_types: ['card'],
      };

      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPaymentTransaction,
        status: PaymentStatus.COMPLETED,
      });
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(paymentRepo.save).not.toHaveBeenCalled();
      expect(result.verified).toBe(true);
    });

    it('should not update status if already FAILED', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'failed',
        amount: 10000,
        currency: 'inr',
        payment_method_types: ['card'],
      };

      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPaymentTransaction,
        status: PaymentStatus.FAILED,
      });
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(paymentRepo.save).not.toHaveBeenCalled();
      expect(result.verified).toBe(true);
    });

    it('should handle Stripe API errors', async () => {
      const paymentIntentId = 'pi_test123';
      const error = new Error('Stripe API error');

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockRejectedValue(error);

      try {
        await service.verifyPaymentStatus(paymentIntentId);
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Failed to verify payment: Stripe API error');
      }
    });

    it('should handle payment not found error', async () => {
      const paymentIntentId = 'pi_test123';

      mockPaymentRepo.findOne.mockResolvedValue(null);

      try {
        await service.verifyPaymentStatus(paymentIntentId);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('Failed to verify payment');
      }
    });

    it('should handle different payment methods', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
        currency: 'inr',
        payment_method_types: ['upi'],
      };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);
      mockPaymentRepo.save.mockResolvedValue(mockPaymentTransaction);

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(result.paymentMethod).toBe('upi');
    });

    it('should handle missing payment_method_types', async () => {
      const paymentIntentId = 'pi_test123';
      const stripePaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 10000,
        currency: 'inr',
      };

      mockPaymentRepo.findOne.mockResolvedValue(mockPaymentTransaction);
      mockStripeService.retrievePaymentIntent.mockResolvedValue(stripePaymentIntent);
      mockPaymentRepo.save.mockResolvedValue(mockPaymentTransaction);

      const result = await service.verifyPaymentStatus(paymentIntentId);

      expect(result.paymentMethod).toBeUndefined();
    });
  });

  describe('getAllPayments', () => {
    it('should get all payments with all filters', async () => {
      const query = {
        status: '3',
        orderId: '123',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: 1,
        limit: 10,
      };
      const mockPayments = [mockPaymentTransaction];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockPayments, 1]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPayments(query);

      expect(paymentRepo.createQueryBuilder).toHaveBeenCalledWith('payment');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('payment.order', 'order');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.status = :status', { status: 3 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.orderId = :orderId', { orderId: '123' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('payment.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: mockPayments,
      });
    });

    it('should get all payments without filters', async () => {
      const query = {
        page: 1,
        limit: 10,
      };
      const mockPayments = [mockPaymentTransaction];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockPayments, 1]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPayments(query);

      expect(paymentRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('payment.createdAt', 'DESC');
      expect(result.total).toBe(1);
    });

    it('should filter by status only', async () => {
      const query = {
        status: '1',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllPayments(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.status = :status', { status: 1 });
    });

    it('should filter by orderId only', async () => {
      const query = {
        orderId: '456',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllPayments(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.orderId = :orderId', { orderId: '456' });
    });

    it('should filter by date range only', async () => {
      const query = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllPayments(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      });
    });

    it('should handle pagination correctly', async () => {
      const query = {
        page: 3,
        limit: 20,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 100]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPayments(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(40);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result.totalPages).toBe(5);
    });

    it('should use default pagination values', async () => {
      const query = {};
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPayments(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should calculate totalPages correctly', async () => {
      const query = {
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 25]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPayments(query);

      expect(result.totalPages).toBe(3);
    });

    it('should handle empty results', async () => {
      const query = {
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPayments(query);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should not apply date filter if only fromDate is provided', async () => {
      const query = {
        fromDate: '2024-01-01',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllPayments(query);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('BETWEEN'),
        expect.anything()
      );
    });

    it('should not apply date filter if only toDate is provided', async () => {
      const query = {
        toDate: '2024-12-31',
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllPayments(query);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('BETWEEN'),
        expect.anything()
      );
    });

    it('should handle database errors', async () => {
      const query = {
        page: 1,
        limit: 10,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockRejectedValue(new Error('Database error')),
      };

      mockPaymentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getAllPayments(query)).rejects.toThrow('Database error');
    });
  });
});
