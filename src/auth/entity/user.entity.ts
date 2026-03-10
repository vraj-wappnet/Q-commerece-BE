import { UserRole } from "src/common/enum/roles.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  mobile: string;

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  adminApproved: boolean;

  @Column({ nullable: true })
  shopLicense: string;

  @Column({ nullable: true })
  vehicleType: string;

  @Column({ nullable: true })
  vehicleName: string;

  @Column({ nullable: true })
  drivingLicense: string;
}
