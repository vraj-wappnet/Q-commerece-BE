import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class cancelOrderDto {
  @ApiProperty({ description: "Order ID to cancel" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
