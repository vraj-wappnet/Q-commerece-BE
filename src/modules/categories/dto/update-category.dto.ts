import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
