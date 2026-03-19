import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryProfileDto } from './create-delivery-profile.dto';

export class UpdateDeliveryProfileDto extends PartialType(CreateDeliveryProfileDto) {}