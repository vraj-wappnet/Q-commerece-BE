import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import e from "express";

export class cancelOrderDto {
  @ApiProperty({ description: "Order ID to cancel" })
  @IsOptional()
  reason?: string;
}
