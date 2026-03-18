import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCartDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}
