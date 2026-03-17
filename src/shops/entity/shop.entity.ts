import { User } from "src/auth/entity/user.entity";
import { Product } from "src/products/entity/product.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Shop {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  shopName: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pinCode: string;

  @Column({ default: "India" })
  country: string;

  @Column({ nullable: true })
  pickupAddress: string;

  // Legal fields
  @Column()
  gstNumber: string;

  @Column()
  panNumber: string;

  @Column({ nullable: true })
  businessRegistrationNumber: string;

  @Column({ nullable: true })
  fssaiNumber: string;

  // Bank Details
  @Column()
  accountHolderName: string;

  @Column()
  accountNumber: string;

  @Column()
  ifscCode: string;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  cancelledChequeImage: string;

  // Contact
  @Column({ nullable: true })
  alternatePhone: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  facebook: string;

  @OneToOne(() => User)
  @JoinColumn()
  seller: User;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;
}
