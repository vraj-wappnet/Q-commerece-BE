import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {

  @ApiProperty({
    example: "user@gmail.com"
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password@123"
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: "Password@123"
  })
  @IsNotEmpty()
  confirmPassword: string;

}