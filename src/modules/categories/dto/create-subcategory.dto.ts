import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateSubCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}

