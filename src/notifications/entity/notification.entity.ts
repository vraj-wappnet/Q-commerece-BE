import { User } from "src/auth/entity/user.entity";
import { NotificationType } from "src/common/enum/status.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification{
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @ManyToOne(() => User)
    user : User;

    @Column()
    title : string;

    @Column()
    message : string;

    @Column({
        type: 'enum',
        enum : NotificationType
    })
    type : NotificationType;

    @Column()
    isRead : boolean;

    @Column()
    createdAt : Date;
}
