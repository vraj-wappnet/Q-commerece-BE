import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsNumber, IsString, IsBoolean } from "class-validator";

export class FilterCartDto {
  @ApiPropertyOptional({ description: "Search by user email or name", example: "john" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by user ID", example: "uuid-user-id" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "Filter by active status", example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Minimum total amount", example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTotalAmount?: number;

  @ApiPropertyOptional({ description: "Maximum total amount", example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTotalAmount?: number;

  @ApiPropertyOptional({
    description: "Sort field",
    enum: ["createdAt", "updatedAt", "totalAmount", "totalItems"],
    example: "createdAt",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: "Sort order", enum: ["ASC", "DESC"], example: "DESC" })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";

  @ApiPropertyOptional({ description: "Created from date (ISO)", example: "2026-01-01" })
  @IsOptional()
  @IsString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: "Created to date (ISO)", example: "2026-12-31" })
  @IsOptional()
  @IsString()
  createdTo?: string;

  @ApiPropertyOptional({ description: "Updated from date (ISO)", example: "2026-01-01" })
  @IsOptional()
  @IsString()
  updatedFrom?: string;

  @ApiPropertyOptional({ description: "Updated to date (ISO)", example: "2026-12-31" })
  @IsOptional()
  @IsString()
  updatedTo?: string;

  @ApiPropertyOptional({ description: "Page number", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: "Items per page (max 100)", example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
