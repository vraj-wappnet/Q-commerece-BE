import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class updateProfileDto {
    @ApiProperty({ example: 'john' })
    @IsOptional()
    firstName: string;

    @ApiProperty({ example: "doe" })
    @IsOptional()
    lastName: string;

    @ApiProperty({ example: "9876543210" })
    @IsOptional()
    mobile: string;

    @ApiProperty({ example: "bike", required: false })
    @IsOptional()
    vehicleType: string;

    @ApiProperty({ example: "Honda Shine", required: false })
    @IsOptional()
    vehicleName?: string;



}