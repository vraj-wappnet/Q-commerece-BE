import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bullmq";
import { Repository } from "typeorm";
import { Notification } from "./entity/notification.entity";


@Injectable()
export class NotificationService{
    constructor(
        @InjectRepository(Notification)
        private notificationRepo : Repository<Notification>,

        @InjectQueue('notification')
        private notificationQueue : Queue
    ) {}

    async sendNotification(data :any){
        await this.notificationQueue.add('sendNotification', data);
    }

    async saveNotification(data : any){
        const notification = this.notificationRepo.create(data);
        return this.notificationRepo.save(notification);
    }

    async getUserNotifications(userId : string){
        return this.notificationRepo.find({
            where: {
                user: { id: userId }
            },
            order: { createdAt: 'DESC' }
        });
    }
}
