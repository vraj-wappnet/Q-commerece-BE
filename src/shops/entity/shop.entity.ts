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
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Shop {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ example: "My Awesome Shop" })
  @Column()
  shopName: string;

  @ApiProperty({ example: "123 Main Street" })
  @Column()
  addressLine1: string;

  @ApiProperty({ required: false, example: "Apartment 4B" })
  @Column({ nullable: true })
  addressLine2: string;

  @ApiProperty({ example: "Mumbai" })
  @Column()
  city: string;

  @ApiProperty({ example: "Maharashtra" })
  @Column()
  state: string;

  @ApiProperty({ example: "400001" })
  @Column()
  pinCode: string;

  @ApiProperty({ default: "India", example: "India" })
  @Column({ default: "India" })
  country: string;

  @Column({ nullable: true })
  pickupAddress: string;

  // Legal fields
  @ApiProperty({
    description: "Shop license document URL or number",
    required: false,
    example: "https://res.cloudinary.com/example/shop-license.pdf"
  })
  @Column({ nullable: true })
  shopLicense: string;

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
