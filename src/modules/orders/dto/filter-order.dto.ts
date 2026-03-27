import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class FilterOrderDto {
  @ApiPropertyOptional({ description: "Search by order ID, customer name/email/mobile or address", example: "order" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by customer user ID", example: "uuid-user-id" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "Filter by delivery person ID", example: "uuid-delivery-user-id" })
  @IsOptional()
  @IsString()
  deliveryPersonId?: string;

  @ApiPropertyOptional({ description: "Filter by order status enum value", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: "Filter by payment status enum value", example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  paymentStatus?: number;

  @ApiPropertyOptional({ description: "Filter by payment method enum value", example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  paymentMethod?: number;

  @ApiPropertyOptional({ description: "Filter paid/unpaid orders", example: true })
  @IsOptional()
  @IsIn([true, false, "true", "false"])
  isPaid?: boolean | "true" | "false";

  @ApiPropertyOptional({ description: "Minimum order total amount", example: 100 })
  @IsOptional()
  @Type(() => Number)
  minTotalAmount?: number;

  @ApiPropertyOptional({ description: "Maximum order total amount", example: 1000 })
  @IsOptional()
  @Type(() => Number)
  maxTotalAmount?: number;

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
    enum: ["createdAt", "updatedAt", "totalAmount", "totalItems", "status", "paymentStatus"],
    example: "createdAt",
  })
  @IsOptional()
  @IsIn(["createdAt", "updatedAt", "totalAmount", "totalItems", "status", "paymentStatus"])
  sortBy?: "createdAt" | "updatedAt" | "totalAmount" | "totalItems" | "status" | "paymentStatus";

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

