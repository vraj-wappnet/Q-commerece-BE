import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class FilterShopDto {
  @ApiPropertyOptional({ example: "shopName" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: "ASC", enum: ["ASC", "DESC"] })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sort?: string;

  @ApiPropertyOptional({ example: "createdAt" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: "2024-01-01" })
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: "2024-12-31" })
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}
