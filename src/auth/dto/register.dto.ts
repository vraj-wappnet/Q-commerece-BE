import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enum/roles.enum';

export class RegisterDto {

    @ApiProperty({
        example: "John",
        description: "First name of user"
    })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        example: "Doe",
        description: "Last name of user"
    })
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        example: "john@gmail.com",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "9876543210"
    })
    @IsNotEmpty()
    mobile: string;

    @ApiProperty({
        example: "Password@123"
    })
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        enum: UserRole,
        example: "customer"
    })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'Shop license URL', required: false })
    @IsOptional()
    shopLicense?: string;

    @ApiProperty({ example: 'Bike', description: 'Type of vehicle for delivery role', required: false })
    @IsOptional()
    vehicleType?: string;

    @ApiProperty({ example: 'Honda Shine', description: 'Name of vehicle for delivery role', required: false })
    @IsOptional()
    vehicleName?: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'Driving license URL', required: false })
    @IsOptional()
    drivingLicense?: string;
}