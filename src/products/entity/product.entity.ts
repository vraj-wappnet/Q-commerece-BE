import { Shop } from "src/shops/entity/shop.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  longDescription: string;

  // Pricing
  @Column("decimal")
  mrp: number;

  @Column("decimal")
  sellingPrice: number;

  @Column({ type: "decimal", nullable: true })
  discountPercentage: number;

  // Inventory
  @Column()
  stockQuantity: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  lowStockThreshold: number;

  // Unit
  @Column()
  unit: string;

  @Column({ nullable: true })
  unitValue: number;

  @Column({ nullable: true })
  packSize: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  subCategory: string;

  @Column({ nullable: true })
  brand: string;

  @Column()
  isVeg: boolean;

  @Column({ nullable: true })
  expiryDays: number;

  @Column("text", { array: true, nullable: true })
  images: string[];

  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: "CASCADE" })
  shop: Shop;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
