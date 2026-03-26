import { User } from "src/auth/entity/user.entity";
import { AssignmentStatus } from "src/common/enum/status.enum";
import { Order } from "src/orders/entity/order.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('delivery_assignments')
@Index(["user","order","status"])

export class DeliveryAssignment {
 
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Order)
    order: Order;

    @ManyToOne(() => User)
    user: User;

    @Column({
        type :'enum',
        enum : AssignmentStatus,
        default : AssignmentStatus.PENDING
    })
    status: AssignmentStatus;

    @CreateDateColumn()
    createdAt: Date;
}