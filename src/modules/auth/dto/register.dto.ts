import { Type } from "class-transformer";
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "src/common/enum/roles.enum";

export class RegisterDto {
  @ApiProperty({
    example: "John",
    description: "First name of user",
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name of user",
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: "john@gmail.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "9876543210",
  })
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({
    example: "Password@123",
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    enum: [
      UserRole.ADMIN,
      UserRole.SELLER,
      UserRole.DELIVERY,
      UserRole.CUSTOMER,
    ],
    example: UserRole.CUSTOMER,
    description: "1=admin, 2=seller, 3=delivery, 4=customer",
  })
  @Type(() => Number)
  @IsInt()
  @IsIn([UserRole.ADMIN, UserRole.SELLER, UserRole.DELIVERY, UserRole.CUSTOMER])
  role: UserRole;

}
