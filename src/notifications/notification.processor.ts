import { Processor } from "@nestjs/bullmq";
import { WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { NotificationService } from "./notification.service";


@Processor('notification')
export class NotificationProcessor extends WorkerHost {
    constructor(private service : NotificationService){
        super();
    }

    async process(job: Job,) {
        const data = job.data;

        await this.service.sendNotification(data);

        console.log('Notification sent successfully', data);
    }
}
