import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssignmentStatus } from "src/common/enum/status.enum";
import { DeliveryAssignment } from "./entity/delivery_assignment.entity";

@Processor('delivery')
export class DeliveryProcessor extends WorkerHost {
    constructor(
        @InjectRepository(DeliveryAssignment)
        private deliveryAssignmentRepo: Repository<DeliveryAssignment>
    ) {
        super();
    }

    async process(job: Job<{ orderId: string; deliveryId: string }>) {
        const {orderId , deliveryId} = job.data;

        const assignment = await this.deliveryAssignmentRepo.findOne({
            where : {
                order : {id : orderId},
                user : {id : deliveryId},
                status : AssignmentStatus.PENDING
            }
        });

        if(!assignment) return;

        assignment.status = AssignmentStatus.EXPIRED;
        await this.deliveryAssignmentRepo.save(assignment);

        // Note: You'll need to call the service method differently to avoid circular dependency
        // Consider using an event or separate service for delivery assignment
    }
}