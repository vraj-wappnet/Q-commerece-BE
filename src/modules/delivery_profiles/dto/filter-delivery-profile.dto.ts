import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class FilterDeliveryProfileDto {
  @ApiPropertyOptional({
    description: "Search by delivery user details, vehicle or address fields",
    example: "ahmedabad",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by delivery user ID", example: "uuid-user-id" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "Filter by city", example: "Ahmedabad" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "Filter by state", example: "Gujarat" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: "Filter by pincode", example: "380001" })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ description: "Filter by vehicle type", example: "Bike" })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({ description: "Filter by availability", example: true })
  @IsOptional()
  @IsIn([true, false, "true", "false"])
  isAvailable?: boolean | "true" | "false";

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
    enum: ["createdAt", "updatedAt", "city", "state", "vehicleType", "isAvailable"],
    example: "createdAt",
  })
  @IsOptional()
  @IsIn(["createdAt", "updatedAt", "city", "state", "vehicleType", "isAvailable"])
  sortBy?: "createdAt" | "updatedAt" | "city" | "state" | "vehicleType" | "isAvailable";

  @ApiPropertyOptional({ description: "Sort direction", enum: ["ASC", "DESC"], example: "DESC" })
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

