import { ApiProperty } from "@nestjs/swagger";

export class ShopVm {
  @ApiProperty({
    description: "Unique shop identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Shop name",
    example: "My Awesome Store"
  })
  shopName: string;

  @ApiProperty({
    description: "Shop address",
    type: "object",
    additionalProperties: true,
    required: []
  })
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };

  @ApiProperty({
    description: "Additional pickup address",
    example: "Warehouse #123, Industrial Area",
    required: false
  })
  pickupAddress?: string;

  @ApiProperty({
    description: "Shop legal information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  legalInfo: {
    shopLicense?: string;
    gstNumber: string;
    panNumber: string;
    businessRegistrationNumber?: string;
    fssaiNumber?: string;
  };

  @ApiProperty({
    description: "Bank information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  bankInfo: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    cancelledChequeImage?: string;
  };

  @ApiProperty({
    description: "Contact information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  contactInfo: {
    alternatePhone?: string;
    whatsappNumber?: string;
    websiteUrl?: string;
    instagram?: string;
    facebook?: string;
  };

  @ApiProperty({
    description: "Shop owner information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };

  @ApiProperty({
    description: "Shop creation date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Shop approval status",
    example: true
  })
  isApproved?: boolean;
}

export class ShopSummaryVm {
  @ApiProperty({
    description: "Shop ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Shop name",
    example: "My Awesome Store"
  })
  shopName: string;

  @ApiProperty({
    description: "Shop city",
    example: "Mumbai"
  })
  city: string;

  @ApiProperty({
    description: "Shop state",
    example: "Maharashtra"
  })
  state: string;

  @ApiProperty({
    description: "Owner name",
    example: "John Doe"
  })
  ownerName: string;

  @ApiProperty({
    description: "Contact number",
    example: "+1234567890"
  })
  mobile: string;

  @ApiProperty({
    description: "Approval status",
    example: true
  })
  isApproved?: boolean;

  @ApiProperty({
    description: "Product count",
    example: 25
  })
  productCount?: number;
}

export class ShopCreateVm {
  @ApiProperty({
    description: "Shop name",
    example: "My Awesome Store"
  })
  shopName: string;

  @ApiProperty({
    description: "Address line 1",
    example: "123 Main Street"
  })
  addressLine1: string;

  @ApiProperty({
    description: "Address line 2",
    example: "Apartment 4B",
    required: false
  })
  addressLine2?: string;

  @ApiProperty({
    description: "City",
    example: "Mumbai"
  })
  city: string;

  @ApiProperty({
    description: "State",
    example: "Maharashtra"
  })
  state: string;

  @ApiProperty({
    description: "PIN code",
    example: "400001"
  })
  pinCode: string;

  @ApiProperty({
    description: "Country",
    example: "India",
    required: false
  })
  country?: string;

  @ApiProperty({
    description: "Pickup address",
    example: "Warehouse #123, Industrial Area",
    required: false
  })
  pickupAddress?: string;

  @ApiProperty({
    description: "Shop license document",
    example: "https://example.com/license.pdf",
    required: false
  })
  shopLicense?: string;

  @ApiProperty({
    description: "GST number",
    example: "27AAAPL1234C1ZV"
  })
  gstNumber: string;

  @ApiProperty({
    description: "PAN number",
    example: "AAAPL1234C"
  })
  panNumber: string;

  @ApiProperty({
    description: "Business registration number",
    example: "BN-123456",
    required: false
  })
  businessRegistrationNumber?: string;

  @ApiProperty({
    description: "FSSAI number",
    example: "12345678901234",
    required: false
  })
  fssaiNumber?: string;

  @ApiProperty({
    description: "Account holder name",
    example: "John Doe"
  })
  accountHolderName: string;

  @ApiProperty({
    description: "Account number",
    example: "1234567890123456"
  })
  accountNumber: string;

  @ApiProperty({
    description: "IFSC code",
    example: "HDFC0001234"
  })
  ifscCode: string;

  @ApiProperty({
    description: "Bank name",
    example: "HDFC Bank"
  })
  bankName: string;

  @ApiProperty({
    description: "Cancelled cheque image",
    example: "https://example.com/cheque.jpg",
    required: false
  })
  cancelledChequeImage?: string;

  @ApiProperty({
    description: "Alternate phone number",
    example: "+1234567890",
    required: false
  })
  alternatePhone?: string;

  @ApiProperty({
    description: "WhatsApp number",
    example: "+1234567890",
    required: false
  })
  whatsappNumber?: string;

  @ApiProperty({
    description: "Website URL",
    example: "https://myawesomestore.com",
    required: false
  })
  websiteUrl?: string;

  @ApiProperty({
    description: "Instagram handle",
    example: "@myawesomestore",
    required: false
  })
  instagram?: string;

  @ApiProperty({
    description: "Facebook page",
    example: "My Awesome Store",
    required: false
  })
  facebook?: string;
}

export class ShopUpdateVm {
  @ApiProperty({
    description: "Shop name",
    example: "My Awesome Store",
    required: false
  })
  shopName?: string;

  @ApiProperty({
    description: "Address line 1",
    example: "123 Main Street",
    required: false
  })
  addressLine1?: string;

  @ApiProperty({
    description: "Address line 2",
    example: "Apartment 4B",
    required: false
  })
  addressLine2?: string;

  @ApiProperty({
    description: "City",
    example: "Mumbai",
    required: false
  })
  city?: string;

  @ApiProperty({
    description: "State",
    example: "Maharashtra",
    required: false
  })
  state?: string;

  @ApiProperty({
    description: "PIN code",
    example: "400001",
    required: false
  })
  pinCode?: string;

  @ApiProperty({
    description: "Country",
    example: "India",
    required: false
  })
  country?: string;

  @ApiProperty({
    description: "Pickup address",
    example: "Warehouse #123, Industrial Area",
    required: false
  })
  pickupAddress?: string;

  @ApiProperty({
    description: "Shop license document",
    example: "https://example.com/license.pdf",
    required: false
  })
  shopLicense?: string;

  @ApiProperty({
    description: "GST number",
    example: "27AAAPL1234C1ZV",
    required: false
  })
  gstNumber?: string;

  @ApiProperty({
    description: "PAN number",
    example: "AAAPL1234C",
    required: false
  })
  panNumber?: string;

  @ApiProperty({
    description: "Business registration number",
    example: "BN-123456",
    required: false
  })
  businessRegistrationNumber?: string;

  @ApiProperty({
    description: "FSSAI number",
    example: "12345678901234",
    required: false
  })
  fssaiNumber?: string;

  @ApiProperty({
    description: "Account holder name",
    example: "John Doe",
    required: false
  })
  accountHolderName?: string;

  @ApiProperty({
    description: "Account number",
    example: "1234567890123456",
    required: false
  })
  accountNumber?: string;

  @ApiProperty({
    description: "IFSC code",
    example: "HDFC0001234",
    required: false
  })
  ifscCode?: string;

  @ApiProperty({
    description: "Bank name",
    example: "HDFC Bank",
    required: false
  })
  bankName?: string;

  @ApiProperty({
    description: "Cancelled cheque image",
    example: "https://example.com/cheque.jpg",
    required: false
  })
  cancelledChequeImage?: string;

  @ApiProperty({
    description: "Alternate phone number",
    example: "+1234567890",
    required: false
  })
  alternatePhone?: string;

  @ApiProperty({
    description: "WhatsApp number",
    example: "+1234567890",
    required: false
  })
  whatsappNumber?: string;

  @ApiProperty({
    description: "Website URL",
    example: "https://myawesomestore.com",
    required: false
  })
  websiteUrl?: string;

  @ApiProperty({
    description: "Instagram handle",
    example: "@myawesomestore",
    required: false
  })
  instagram?: string;

  @ApiProperty({
    description: "Facebook page",
    example: "My Awesome Store",
    required: false
  })
  facebook?: string;
}
