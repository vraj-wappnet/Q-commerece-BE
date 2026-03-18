import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddToCartDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}
