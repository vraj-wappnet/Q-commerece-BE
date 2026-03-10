import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class resendOtpDto{
    @ApiProperty({example : "test@gmail.com"})
    @IsEmail()
    email : string

    
}