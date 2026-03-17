import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "john@gmail.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password@123",
  })
  @IsNotEmpty()
  password: string;
}
