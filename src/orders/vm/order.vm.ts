import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";

export class OrderItemVm {
  @ApiProperty({
    description: "Unique order item identifier",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "Product details",
    type: "object",
    additionalProperties: true,
    required: []
  })
  product: {
    id: string;
    name: string;
    images: string[];
    sellingPrice: number;
  };

  @ApiProperty({
    description: "Quantity of the product ordered",
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: "Price per unit of the product",
    example: 49.99
  })
  price: number;

  @ApiProperty({
    description: "Total price for this order item (quantity × price)",
    example: 99.98
  })
  totalPrice: number;
}

export class OrderVm {
  @ApiProperty({
    description: "Unique order identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Customer information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };

  @ApiProperty({
    description: "List of items in the order",
    type: [OrderItemVm]
  })
  items: OrderItemVm[];

  @ApiProperty({
    description: "Total amount of the order",
    example: 299.99
  })
  totalAmount: number;

  @ApiProperty({
    description: "Delivery charge for the order",
    example: 50.00
  })
  deliveryCharge: number;

  @ApiProperty({
    description: "Total number of items in the order",
    example: 3
  })
  totalItems: number;

  @ApiProperty({
    description: "Current status of the order",
    enum: OrderStatus,
    example: OrderStatus.PENDING
  })
  status: OrderStatus;

  @ApiProperty({
    description: "Payment method used for the order",
    enum: paymentMethod,
    example: paymentMethod.CASH_ON_DELIVERY
  })
  paymentMethod: paymentMethod;

  @ApiProperty({
    description: "Payment status of the order",
    enum: PaymentStatus,
    example: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: "Delivery address",
    type: "object",
    additionalProperties: true,
    required: []
  })
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };

  @ApiProperty({
    description: "Whether the order has been paid",
    example: false
  })
  isPaid: boolean;

  @ApiProperty({
    description: "Delivery person information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  deliveryPerson?: {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
  };

  @ApiProperty({
    description: "Date and time when order was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date and time when order was last updated",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Formatted order status label",
    example: "Pending"
  })
  statusLabel?: string;

  @ApiProperty({
    description: "Formatted payment status label",
    example: "Pending"
  })
  paymentStatusLabel?: string;

  @ApiProperty({
    description: "Formatted payment method label",
    example: "Cash on Delivery"
  })
  paymentMethodLabel?: string;
}

export class OrderSummaryVm {
  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Customer name",
    example: "John Doe"
  })
  customerName: string;

  @ApiProperty({
    description: "Total amount",
    example: 299.99
  })
  totalAmount: number;

  @ApiProperty({
    description: "Order status",
    enum: OrderStatus,
    example: OrderStatus.PENDING
  })
  status: OrderStatus;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: "Number of items",
    example: 3
  })
  totalItems: number;

  @ApiProperty({
    description: "Order date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Formatted status",
    example: "Pending"
  })
  statusLabel?: string;
}

export class OrderTrackVm {
  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Order status",
    enum: OrderStatus,
    example: OrderStatus.OUT_FOR_DELIVERY
  })
  status: OrderStatus;

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: "Payment method",
    enum: paymentMethod,
    example: paymentMethod.CASH_ON_DELIVERY
  })
  paymentMethod: paymentMethod;

  @ApiProperty({
    description: "Total amount",
    example: 299.99
  })
  totalAmount: number;

  @ApiProperty({
    description: "Delivery charge",
    example: 50.00
  })
  deliveryCharge: number;

  @ApiProperty({
    description: "Delivery address",
    type: "object",
    additionalProperties: true,
    required: []
  })
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };

  @ApiProperty({
    description: "Order items",
    type: [OrderItemVm]
  })
  items: OrderItemVm[];

  @ApiProperty({
    description: "Customer contact",
    type: "object",
    additionalProperties: true,
    required: []
  })
  customer?: {
    name: string;
    email: string;
    mobile: string;
  };

  @ApiProperty({
    description: "Delivery person info",
    type: "object",
    additionalProperties: true,
    required: []
  })
  deliveryPerson?: {
    name: string;
    mobile: string;
  };

  @ApiProperty({
    description: "Order creation date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;
}

export class OrderCreateVm {
  @ApiProperty({
    description: "List of items to order",
    type: [OrderItemVm]
  })
  items: OrderItemVm[];

  @ApiProperty({
    description: "Delivery address",
    type: "object",
    additionalProperties: true,
    required: []
  })
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };

  @ApiProperty({
    description: "Payment method",
    enum: paymentMethod,
    example: paymentMethod.CASH_ON_DELIVERY
  })
  paymentMethod: paymentMethod;
}
