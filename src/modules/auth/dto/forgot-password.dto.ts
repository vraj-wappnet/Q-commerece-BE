import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class forgotPasswordDto {
  @ApiProperty({
    example: "wappnet95@gmail.com",
    description: "enter your register email Address",
  })
  @IsEmail()
  email: string;
}
