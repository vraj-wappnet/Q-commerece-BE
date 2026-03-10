import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Otp{
    @PrimaryGeneratedColumn('uuid')
    id : string

    @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  expiresAt: Date;
}