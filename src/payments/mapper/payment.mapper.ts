import { PaymentTransaction } from "../entity/payment-transaction.entity";
import { 
  PaymentTransactionVm, 
  PaymentTransactionSummaryVm, 
  PaymentIntentVm, 
  PaymentVerificationVm, 
  PaymentWebhookVm 
} from "../vm/payment.vm";
import { PaymentStatus } from "src/common/enum/status.enum";

export class PaymentMapper {
  static toPaymentTransactionVm(transaction: PaymentTransaction): PaymentTransactionVm {
    return {
      id: transaction.id,
      order: transaction.order ? {
        id: transaction.order.id,
        totalAmount: Number(transaction.order.totalAmount),
        status: transaction.order.status.toString(),
      } : undefined,
      paymentIntentId: transaction.paymentIntentId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      paymentMethodId: transaction.paymentMethodId,
      transactionDate: transaction.transactionDate,
      stripeResponse: transaction.stripeResponse,
      failureReason: transaction.failureReason,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      statusLabel: this.getStatusLabel(transaction.status),
      formattedAmount: this.formatAmount(Number(transaction.amount), transaction.currency),
    };
  }

  static toPaymentTransactionSummaryVm(transaction: PaymentTransaction): PaymentTransactionSummaryVm {
    return {
      id: transaction.id,
      orderId: transaction.orderId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      transactionDate: transaction.transactionDate,
      statusLabel: this.getStatusLabel(transaction.status),
      formattedAmount: this.formatAmount(Number(transaction.amount), transaction.currency),
    };
  }

  static toPaymentIntentVm(paymentIntentId: string, orderId: string, amount: number, currency: string, clientSecret: string): PaymentIntentVm {
    return {
      clientSecret,
      paymentIntentId,
      orderId,
      amount,
      currency,
      status: PaymentStatus.PENDING,
    };
  }

  static toPaymentVerificationVm(success: boolean, status: PaymentStatus, message: string, data?: { transactionId?: string; orderId?: string; amount?: number; error?: string }): PaymentVerificationVm {
    return {
      success,
      status,
      message,
      transactionId: data?.transactionId,
      orderId: data?.orderId,
      amount: data?.amount,
      error: data?.error,
    };
  }

  static toPaymentTransactionVmList(transactions: PaymentTransaction[]): PaymentTransactionVm[] {
    return transactions.map(transaction => this.toPaymentTransactionVm(transaction));
  }

  static toPaymentTransactionSummaryVmList(transactions: PaymentTransaction[]): PaymentTransactionSummaryVm[] {
    return transactions.map(transaction => this.toPaymentTransactionSummaryVm(transaction));
  }

  static toPaymentTransactionEntity(orderId: string, paymentIntentId: string, amount: number, currency: string, stripeResponse?: any): Partial<PaymentTransaction> {
    return {
      orderId,
      paymentIntentId,
      amount,
      currency,
      status: PaymentStatus.PENDING,
      stripeResponse,
      order: { id: orderId } as any,
    };
  }

  private static getStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'Pending';
      case PaymentStatus.PROCESSING:
        return 'Processing';
      case PaymentStatus.COMPLETED:
        return 'Completed';
      case PaymentStatus.FAILED:
        return 'Failed';
      case PaymentStatus.REFUNDED:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  }

  private static formatAmount(amount: number, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}
