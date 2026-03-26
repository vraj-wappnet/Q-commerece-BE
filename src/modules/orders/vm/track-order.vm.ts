import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";

export class TrackOrderProductVm {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "Fresh Apples" })
  name: string;

  @ApiProperty({ type: [String], example: ["https://cdn.example.com/apple.png"] })
  images: string[];
}

export class TrackOrderItemVm {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 199.99 })
  price: number;

  @ApiProperty({ example: 399.98 })
  totalPrice: number;

  @ApiProperty({ type: () => TrackOrderProductVm })
  product: TrackOrderProductVm;
}

export class TrackOrderUserVm {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "John", required: false })
  firstName: string;

  @ApiProperty({ example: "Doe", required: false })
  lastName: string;

  @ApiProperty({ example: "john@example.com", required: false })
  email: string;

  @ApiProperty({ example: "9876543210", required: false })
  mobile: string;
}

export class TrackOrderVm {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: paymentMethod, example: paymentMethod.CASH_ON_DELIVERY })
  paymentMethod: paymentMethod;

  @ApiProperty({ example: 599.99 })
  totalAmount: number;

  @ApiProperty({ example: 50 })
  deliveryCharge: number;

  @ApiProperty({ example: 3 })
  totalItems: number;

  @ApiProperty({ example: "2026-03-25T08:20:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-03-25T08:35:00.000Z" })
  updatedAt: Date;

  @ApiProperty({ example: "123 Main Street", required: false })
  addressLine1: string;

  @ApiProperty({ example: "Near City Mall", required: false })
  addressLine2: string;

  @ApiProperty({ example: "Surat", required: false })
  city: string;

  @ApiProperty({ example: "Gujarat", required: false })
  state: string;

  @ApiProperty({ example: "India", required: false })
  country: string;

  @ApiProperty({ example: "395006", required: false })
  pincode: string;

  @ApiProperty({ example: 21.17024 })
  latitude: number;

  @ApiProperty({ example: 72.831061 })
  longitude: number;

  @ApiProperty({ example: false })
  isPaid: boolean;

  @ApiProperty({ type: () => [TrackOrderItemVm] })
  items: TrackOrderItemVm[];

  @ApiProperty({ type: () => TrackOrderUserVm })
  user: TrackOrderUserVm;
}
