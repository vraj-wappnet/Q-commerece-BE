import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class FilterProductDto {
  @ApiPropertyOptional({ example: "milk" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ example: "Dairy" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: "ASC", enum: ["ASC", "DESC"] })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";

  @ApiPropertyOptional({ example: "createdAt" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}

