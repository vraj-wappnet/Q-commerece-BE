import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateSubCategoryDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  categoryId?: string;
}
