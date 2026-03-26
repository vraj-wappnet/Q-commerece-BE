import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { paymentMethod } from "src/common/enum/status.enum";

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    example: "400001",
    description: "PIN code for delivery"
  })
  @IsNotEmpty()
  @IsString()
  pincode: string;

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

  @ApiProperty({
    enum: paymentMethod,
    example: paymentMethod.CASH_ON_DELIVERY
  })
  @IsNotEmpty()
  @IsEnum(paymentMethod)
  paymentMethod: paymentMethod;
}
