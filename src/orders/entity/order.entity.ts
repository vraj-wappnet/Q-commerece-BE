import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

import { User } from "src/auth/entity/user.entity";
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";
import { OrderItem } from "./order-item.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
@Index(["user", "createdAt"])
@Index(["status"])
@Index(["paymentStatus"])

export class Order {
  @ApiProperty({
    description: "Unique order identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: "User who placed the order",
    type: () => User
  })
  @ManyToOne(() => User)
  user: User;

  @ApiProperty({
    description: "List of items in the order",
    type: () => [OrderItem]
  })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  @ApiProperty({
    description: "Total amount of the order",
    example: 299.99,
    type: "number"
  })
  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({
    description: "Delivery charge for the order",
    example: 50.00,
    type: "number",
    default: 0
  })
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @ApiProperty({
    description: "Total number of items in the order",
    example: 3
  })
  @Column()
  totalItems: number;

  @ApiProperty({
    description: "Current status of the order",
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    default: OrderStatus.PENDING
  })
  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: "Payment method used for the order",
    enum: paymentMethod,
    required: false,
    example: paymentMethod.CASH_ON_DELIVERY
  })
  @Column({
    type: "enum",
    enum: paymentMethod,
    nullable: true
  })
  paymentMethod: paymentMethod;

  @ApiProperty({
    description: "Payment status of the order",
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING
  })
  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: "First line of delivery address",
    required: false,
    example: "123 Main Street"
  })
  @Column({ nullable: true })
  addressLine1: string;

  @ApiProperty({
    description: "Second line of delivery address",
    required: false,
    example: "Apartment 4B"
  })
  @Column({ nullable: true })
  addressLine2: string;

  @ApiProperty({
    description: "City for delivery",
    required: false,
    example: "Mumbai"
  })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({
    description: "State for delivery",
    required: false,
    example: "Maharashtra"
  })
  @Column({ nullable: true })
  state: string;

  @ApiProperty({
    description: "Country for delivery",
    required: false,
    example: "India"
  })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({
    description: "PIN code for delivery",
    required: false,
    example: "400001"
  })
  @Column({ nullable: true })
  pincode: string;

  @ApiProperty({
    description: "Latitude of delivery location",
    required: true,
    example: 19.076090,
    type: "number"
  })
  @Column({ type: "decimal", precision: 10, scale: 6 })
  latitude: number;

  @ApiProperty({
    description: "Longitude of delivery location",
    required: true,
    example: 72.877426,
    type: "number"
  })
  @Column({ type: "decimal", precision: 10, scale: 6 })
  longitude: number;

  @ApiProperty({
    description: "Payment status of the order",
    example: false,
    default: false
  })
  @Column({ default: false })
  isPaid: boolean;

  @ApiProperty({
    description: "Date and time when the order was created",
    example: "2024-01-15T10:30:00Z"
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "Date and time when the order was last updated",
    example: "2024-01-15T11:00:00Z"
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: "Reason for order cancellation",
    required: false,
    example: "Customer requested cancellation"
  })
  @Column({ nullable: true })
  cancelReason: string;

  @ApiProperty({
    description: "Date and time when the order was cancelled",
    required: false,
    example: "2024-01-15T12:00:00Z"
  })
  @Column({ nullable: true })
  cancelledAt: Date;

  @ManyToOne(() => User, { nullable: true })
  deliveryPerson: User;

  @Column({ nullable: true })
  assignedAt: Date;
}
