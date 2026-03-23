import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


import { User } from 'src/auth/entity/user.entity';

@Entity()
export class DeliveryProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Vehicle Info
  @Column()
  vehicleType: string;

  @Column()
  vehicleName: string;

  @Column()
  rcBookPhoto: string;

  @Column()
  licensePhoto: string;

  // Address
  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  // Location
  @Column({ nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ default: true, nullable: true, select: false })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
