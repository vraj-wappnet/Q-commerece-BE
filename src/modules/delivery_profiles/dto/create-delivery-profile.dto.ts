import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryProfileDto {

  @ApiProperty()
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty()
  @IsNotEmpty()
  vehicleName: string;

  @ApiProperty()
  @IsNotEmpty()
  rcBookPhoto: string;

  @ApiProperty()
  @IsNotEmpty()
  licensePhoto: string;

  @ApiProperty()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ required: false })
  @IsOptional()
  addressLine2?: string;

  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 19.076090,
    description: "Latitude of delivery location"
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    example: 72.877426,
    description: "Longitude of delivery location"
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  longitude: number;
}