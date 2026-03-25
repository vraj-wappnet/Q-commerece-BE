import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryAssignment } from "./entity/delivery_assignment.entity";
import { DeliveryProcessor } from "./delivery_assignment.processor";

@Module({
    imports : [
        BullModule.registerQueue({
            name : 'delivery'
        }),
        TypeOrmModule.forFeature([DeliveryAssignment])
    ],
    providers: [DeliveryProcessor],
    exports: [BullModule]
})

export class DeliveryQueueModule{}