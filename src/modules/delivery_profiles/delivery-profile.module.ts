import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryProfile } from "./entity/delivery-profile.entity";
import { DeliveryProfileController } from "./delivery-profile.controller";
import { DeliveryProfileService } from "./delivery-profile.service";


@Module({
    imports: [TypeOrmModule.forFeature([DeliveryProfile])],
    controllers: [DeliveryProfileController],
    providers : [DeliveryProfileService]
})
export class DeliveryProfileModule {}