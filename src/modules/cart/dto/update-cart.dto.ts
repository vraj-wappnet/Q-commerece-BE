import { IsNumber, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCartDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}
