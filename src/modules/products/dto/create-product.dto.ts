import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  longDescription?: string;

  // Pricing
  @ApiProperty()
  @IsNumber()
  mrp: number;

  @ApiProperty()
  @IsNumber()
  sellingPrice: number;

  @ApiProperty()
  @IsOptional()
  discountPercentage?: number;

  // Inventory
  @ApiProperty()
  @IsNumber()
  stockQuantity: number;

  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty()
  @IsOptional()
  lowStockThreshold?: number;

  // Unit
  @ApiProperty()
  @IsNotEmpty()
  unit: string;

  @ApiProperty()
  @IsOptional()
  unitValue?: number;

  @ApiProperty()
  @IsOptional()
  packSize?: string;

  // Category
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  @ApiProperty()
  @IsOptional()
  brand?: string;

  // Quick commerce
  @ApiProperty()
  @IsBoolean()
  isVeg: boolean;

  @ApiProperty()
  @IsOptional()
  expiryDays?: number;

  // Images
  @ApiProperty({ type: [String] })
  @IsArray()
  imageUrls: string[];

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  shopId: string;
}
