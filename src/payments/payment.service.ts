import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction } from './entity/payment-transaction.entity';
import { PaymentStatus } from '../common/enum/status.enum';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentRepo: Repository<PaymentTransaction>,
    private stripeService: StripeService,
  ) {}

  async createPaymentTransaction(data: {
    orderId: string;
    paymentIntentId: string;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
  }): Promise<PaymentTransaction> {
    const payment = this.paymentRepo.create({
      orderId: data.orderId,
      paymentIntentId: data.paymentIntentId,
      amount: Number(data.amount.toFixed(2)),
      currency: data.currency || 'INR',
      status: data.status || PaymentStatus.PENDING,
    });

    return await this.paymentRepo.save(payment);
  }

  async updatePaymentStatus(
    paymentIntentId: string,
    status: PaymentStatus,
    additionalData?: {
      paymentMethod?: string;
      paymentMethodId?: string;
      stripeResponse?: any;
      failureReason?: string;
    },
  ): Promise<PaymentTransaction> {
    const payment = await this.paymentRepo.findOne({
      where: { paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    payment.status = status;
    payment.transactionDate = new Date();

    if (additionalData) {
      if (additionalData.paymentMethod) {
        payment.paymentMethod = additionalData.paymentMethod;
      }
      if (additionalData.paymentMethodId) {
        payment.paymentMethodId = additionalData.paymentMethodId;
      }
      if (additionalData.stripeResponse) {
        payment.stripeResponse = additionalData.stripeResponse;
      }
      if (additionalData.failureReason) {
        payment.failureReason = additionalData.failureReason;
      }
    }

    return await this.paymentRepo.save(payment);
  }

  async getPaymentByOrderId(orderId: string): Promise<PaymentTransaction> {
    const payment = await this.paymentRepo.findOne({
      where: { orderId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found for this order');
    }

    return payment;
  }

  async getPaymentByIntentId(paymentIntentId: string): Promise<PaymentTransaction> {
    const payment = await this.paymentRepo.findOne({
      where: { paymentIntentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    return payment;
  }

  async verifyPaymentStatus(paymentIntentId: string): Promise<{
    verified: boolean;
    status: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
  }> {
    try {
      // Get payment from database
      const payment = await this.getPaymentByIntentId(paymentIntentId);

      // Verify with Stripe
      const stripePaymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

      // Update local status if different
      if (stripePaymentIntent.status === 'succeeded' && payment.status !== PaymentStatus.COMPLETED) {
        await this.updatePaymentStatus(paymentIntentId, PaymentStatus.COMPLETED, {
          paymentMethod: stripePaymentIntent.payment_method_types?.[0],
          stripeResponse: stripePaymentIntent,
        });
      } else if ((stripePaymentIntent.status as string) === 'failed' && payment.status !== PaymentStatus.FAILED) {
        await this.updatePaymentStatus(paymentIntentId, PaymentStatus.FAILED, {
          failureReason: stripePaymentIntent.last_payment_error?.message,
          stripeResponse: stripePaymentIntent,
        });
      }

      return {
        verified: true,
        status: stripePaymentIntent.status,
        amount: stripePaymentIntent.amount / 100,
        currency: stripePaymentIntent.currency,
        paymentMethod: stripePaymentIntent.payment_method_types?.[0],
      };
    } catch (error) {
      throw new BadRequestException(`Failed to verify payment: ${error.message}`);
    }
  }

  async getAllPayments(query: any) {
    const {
      status,
      orderId,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order');

    if (status) {
      qb.andWhere('payment.status = :status', { status: parseInt(status) });
    }

    if (orderId) {
      qb.andWhere('payment.orderId = :orderId', { orderId });
    }

    if (fromDate && toDate) {
      qb.andWhere('payment.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    qb.orderBy('payment.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      data,
    };
  }
}
