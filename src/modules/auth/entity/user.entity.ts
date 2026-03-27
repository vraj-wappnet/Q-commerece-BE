import { Role } from "src/modules/roles-permission/entity/roles.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from "typeorm";

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

  @ManyToOne(() => Role)
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  adminApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
