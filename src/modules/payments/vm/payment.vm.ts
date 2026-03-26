import { ApiProperty } from "@nestjs/swagger";
import { PaymentStatus } from "src/common/enum/status.enum";

export class PaymentTransactionVm {
  @ApiProperty({
    description: "Unique payment transaction identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Order information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  order?: {
    id: string;
    totalAmount: number;
    status: string;
  };

  @ApiProperty({
    description: "Payment intent ID",
    example: "pi_1234567890"
  })
  paymentIntentId: string;

  @ApiProperty({
    description: "Payment amount",
    example: 299.99
  })
  amount: number;

  @ApiProperty({
    description: "Currency code",
    example: "INR"
  })
  currency: string;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED
  })
  status: PaymentStatus;

  @ApiProperty({
    description: "Payment method used",
    example: "Stripe"
  })
  paymentMethod: string;

  @ApiProperty({
    description: "Payment method ID",
    example: "card_1234567890"
  })
  paymentMethodId?: string;

  @ApiProperty({
    description: "Transaction date and time",
    example: "2024-01-15T10:30:00Z"
  })
  transactionDate?: Date;

  @ApiProperty({
    description: "Payment gateway response",
    type: "object",
    additionalProperties: true,
    required: []
  })
  stripeResponse?: any;

  @ApiProperty({
    description: "Failure reason if payment failed",
    example: "Insufficient funds",
    required: false
  })
  failureReason?: string;

  @ApiProperty({
    description: "Transaction creation date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Transaction last update date",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Formatted status label",
    example: "Completed"
  })
  statusLabel?: string;

  @ApiProperty({
    description: "Formatted amount with currency",
    example: "₹299.99"
  })
  formattedAmount?: string;
}

export class PaymentTransactionSummaryVm {
  @ApiProperty({
    description: "Transaction ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId: string;

  @ApiProperty({
    description: "Payment amount",
    example: 299.99
  })
  amount: number;

  @ApiProperty({
    description: "Currency",
    example: "INR"
  })
  currency: string;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED
  })
  status: PaymentStatus;

  @ApiProperty({
    description: "Payment method",
    example: "Stripe"
  })
  paymentMethod: string;

  @ApiProperty({
    description: "Transaction date",
    example: "2024-01-15T10:30:00Z"
  })
  transactionDate?: Date;

  @ApiProperty({
    description: "Status label",
    example: "Completed"
  })
  statusLabel?: string;

  @ApiProperty({
    description: "Formatted amount",
    example: "₹299.99"
  })
  formattedAmount?: string;
}

export class PaymentIntentVm {
  @ApiProperty({
    description: "Payment intent client secret",
    example: "pi_1234567890_secret_ABC123"
  })
  clientSecret: string;

  @ApiProperty({
    description: "Payment intent ID",
    example: "pi_1234567890"
  })
  paymentIntentId: string;

  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId: string;

  @ApiProperty({
    description: "Payment amount",
    example: 299.99
  })
  amount: number;

  @ApiProperty({
    description: "Currency",
    example: "INR"
  })
  currency: string;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.PENDING
  })
  status: PaymentStatus;
}

export class PaymentCreateVm {
  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId: string;

  @ApiProperty({
    description: "Payment amount",
    example: 299.99
  })
  amount: number;

  @ApiProperty({
    description: "Currency code",
    example: "INR"
  })
  currency: string;

  @ApiProperty({
    description: "Payment method",
    example: "card"
  })
  paymentMethod?: string;

  @ApiProperty({
    description: "Return URL for success",
    example: "https://example.com/success"
  })
  returnUrl?: string;

  @ApiProperty({
    description: "Cancel URL",
    example: "https://example.com/cancel"
  })
  cancelUrl?: string;
}

export class PaymentVerificationVm {
  @ApiProperty({
    description: "Payment verification status",
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED
  })
  status: PaymentStatus;

  @ApiProperty({
    description: "Transaction ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  transactionId?: string;

  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId?: string;

  @ApiProperty({
    description: "Payment amount",
    example: 299.99
  })
  amount?: number;

  @ApiProperty({
    description: "Success message",
    example: "Payment verified successfully"
  })
  message: string;

  @ApiProperty({
    description: "Error message if failed",
    example: "Invalid payment signature",
    required: false
  })
  error?: string;
}

export class PaymentWebhookVm {
  @ApiProperty({
    description: "Webhook event type",
    example: "payment_intent.succeeded"
  })
  eventType: string;

  @ApiProperty({
    description: "Payment intent ID",
    example: "pi_1234567890"
  })
  paymentIntentId: string;

  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId?: string;

  @ApiProperty({
    description: "Payment amount",
    example: 299.99
  })
  amount: number;

  @ApiProperty({
    description: "Currency",
    example: "INR"
  })
  currency: string;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED
  })
  status: PaymentStatus;

  @ApiProperty({
    description: "Customer email",
    example: "customer@example.com"
  })
  customerEmail?: string;

  @ApiProperty({
    description: "Payment method details",
    type: "object",
    additionalProperties: true,
    required: []
  })
  paymentMethod?: {
    type: string;
    brand: string;
    last4: string;
  };

  @ApiProperty({
    description: "Stripe signature for verification",
    example: "v1_abc123..."
  })
  stripeSignature?: string;
}
