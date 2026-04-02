import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({
    example: "user@gmail.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password@123",
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: "Password@123",
  })
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    example: "123456",
    description: "OTP received on email for password reset",
  })
  @IsNotEmpty()
  otp: string;
}
