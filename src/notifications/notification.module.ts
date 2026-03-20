import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { NotificationService } from "./notification.service";
import { NotificationProcessor } from "./notification.processor";
import { NotificationController } from "./notification.controller";
import { Notification } from "./entity/notification.entity";

@Module({
    imports : [
        TypeOrmModule.forFeature([Notification]),
        BullModule.registerQueue({
            name : 'notification'
        })
    ],
    controllers : [NotificationController],
    providers : [NotificationService , NotificationProcessor],
    exports : [NotificationService],
})
export class NotificationModule {}