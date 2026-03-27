import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterSubCategoryDto {
  @ApiPropertyOptional({
    description: "Search by subcategory or category name",
    example: "snacks",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by subcategory name", example: "chips" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by parent category ID", example: "uuid-category-id" })
  @IsOptional()
  @IsString()
  categoryId?: string;

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

  @ApiPropertyOptional({
    description: "Sort field",
    enum: ["name", "createdAt", "updatedAt"],
    example: "name",
  })
  @IsOptional()
  @IsIn(["name", "createdAt", "updatedAt"])
  sortBy?: "name" | "createdAt" | "updatedAt";

  @ApiPropertyOptional({ description: "Sort direction", enum: ["ASC", "DESC"], example: "ASC" })
  @IsOptional()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";

  @ApiPropertyOptional({ description: "Page number", example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "Items per page (max 100)", example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
