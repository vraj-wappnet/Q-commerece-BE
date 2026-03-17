import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsUrl, Matches } from "class-validator";

export class CreateShopDto {
  @ApiProperty()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty()
  @IsOptional()
  addressLine2: string;

  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @Matches(/^[1-9][0-9]{5}$/, { message: "Invalid PIN Code" })
  pinCode: string;

  @ApiProperty({ default: "India" })
  country: string;

  @ApiProperty()
  @IsOptional()
  pickupAddress: string;

  // GST Validation
  @ApiProperty()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: "Invalid GST Number",
  })
  gstNumber: string;

  // PAN validation
  @ApiProperty()
  @Matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, {
    message: "Invalid PAN Number",
  })
  panNumber: string;

  @ApiProperty()
  @IsOptional()
  businessRegistrationNumber: string;

  @ApiProperty()
  @IsOptional()
  fssaiNumber: string;

  // Bank
  @ApiProperty()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty()
  @Matches(/^[0-9]{9,18}$/)
  accountNumber: string;

  @ApiProperty()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
  ifscCode: string;

  @ApiProperty()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsOptional()
  cancelledChequeImage: string;

  @ApiProperty()
  @IsOptional()
  alternatePhone: string;

  @ApiProperty()
  @IsOptional()
  whatsappNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  websiteUrl: string;

  @ApiProperty()
  @IsOptional()
  instagram: string;

  @ApiProperty()
  @IsOptional()
  facebook: string;
}
