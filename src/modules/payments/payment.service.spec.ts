import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentTransaction } from './entity/payment-transaction.entity';
import { PaymentStatus } from 'src/common/enum/status.enum';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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

      await expect(service.updatePaymentStatus(paymentIntentId, PaymentStatus.COMPLETED))
        .rejects.toThrow(NotFoundException);
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

      await expect(service.getPaymentByOrderId(orderId))
        .rejects.toThrow(NotFoundException);
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

      await expect(service.getPaymentByIntentId(paymentIntentId))
        .rejects.toThrow(NotFoundException);
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

  describe('getAllPayments', () => {
    it('should get all payments with filters', async () => {
      const query = {
        status: PaymentStatus.COMPLETED,
        orderId: '123',
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

      await service.getAllPayments(query);

      expect(paymentRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
