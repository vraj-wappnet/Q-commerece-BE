import { Processor } from "@nestjs/bullmq";
import { WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./entity/notification.entity";
import { Logger } from "@nestjs/common";


@Processor('notification')
export class NotificationProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>
    ) {
        super();
    }

    async process(job: Job) {
        const data = job.data;
        
        try {
            // Save the notification to database
            const notification = this.notificationRepo.create({
                ...data,
                isRead: false, // New notifications are unread by default
                createdAt: new Date()
            });
            await this.notificationRepo.save(notification);
            
            this.logger.log(`Notification saved successfully for user: ${data.user?.id || data.user}`);
            
            // Here you could add real-time notification logic (WebSocket, Push, etc.)
            // For now, just saving to database is enough
            
        } catch (error) {
            this.logger.error('Failed to save notification:', error);
            throw error;
        }
    }
}
