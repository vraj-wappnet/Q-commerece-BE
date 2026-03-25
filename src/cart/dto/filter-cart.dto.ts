import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsString, IsBoolean } from "class-validator";

export class FilterCartDto {
  @ApiProperty({ required: false, description: "Search by user email or name" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: "Filter by user ID" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, description: "Filter by active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: "Minimum total amount" })
  @IsOptional()
  @IsNumber()
  minTotalAmount?: number;

  @ApiProperty({ required: false, description: "Maximum total amount" })
  @IsOptional()
  @IsNumber()
  maxTotalAmount?: number;

  @ApiProperty({ required: false, description: "Sort by field", example: "createdAt" })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, description: "Sort order", example: "DESC" })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ required: false, description: "Page number", example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, description: "Items per page", example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
