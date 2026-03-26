import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Index,
} from 'typeorm';

import { Order } from './order.entity';
import { Product } from 'src/products/entity/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(["order"])
@Index(["product"])

export class OrderItem {
  @ApiProperty({
    description: "Unique order item identifier",
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "Order this item belongs to",
    type: () => Order
  })
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ApiProperty({
    description: "Product details for this order item",
    type: () => Product
  })
  @ManyToOne(() => Product)
  product: Product;

  @ApiProperty({
    description: "Quantity of the product ordered",
    example: 2
  })
  @Column()
  quantity: number;

  @ApiProperty({
    description: "Price per unit of the product",
    example: 49.99,
    type: "number"
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: "Total price for this order item (quantity × price)",
    example: 99.98,
    type: "number"
  })
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;
}