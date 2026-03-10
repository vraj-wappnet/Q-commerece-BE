import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {

    @ApiProperty({
        example: "john@gmail.com"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "123456"
    })
    @IsNotEmpty()
    otp: string;
}