import { ApiProperty } from "@nestjs/swagger";

export class DeliveryProfileVm {
  @ApiProperty({
    description: "Unique delivery profile identifier",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "Delivery person information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };

  @ApiProperty({
    description: "Vehicle information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  vehicle: {
    type: string;
    name: string;
    rcBookPhoto: string;
    licensePhoto: string;
  };

  @ApiProperty({
    description: "Delivery person address",
    type: "object",
    additionalProperties: true,
    required: []
  })
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };

  @ApiProperty({
    description: "Location coordinates",
    type: "object",
    additionalProperties: true,
    required: []
  })
  location: {
    latitude: number;
    longitude: number;
    location?: string;
  };

  @ApiProperty({
    description: "Whether delivery person is currently available",
    example: true
  })
  isAvailable?: boolean;

  @ApiProperty({
    description: "Date and time when profile was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date and time when profile was last updated",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;
}

export class DeliveryProfileSummaryVm {
  @ApiProperty({
    description: "Delivery profile ID",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "Delivery person name",
    example: "John Doe"
  })
  fullName: string;

  @ApiProperty({
    description: "Vehicle type",
    example: "Bike"
  })
  vehicleType: string;

  @ApiProperty({
    description: "Availability status",
    example: true
  })
  isAvailable?: boolean;

  @ApiProperty({
    description: "Mobile number",
    example: "+1234567890"
  })
  mobile: string;
}

export class DeliveryProfileCreateVm {
  @ApiProperty({
    description: "Vehicle type",
    example: "Bike"
  })
  vehicleType: string;

  @ApiProperty({
    description: "Vehicle name",
    example: "Honda Activa"
  })
  vehicleName: string;

  @ApiProperty({
    description: "RC book photo URL",
    example: "https://example.com/rc-book.jpg"
  })
  rcBookPhoto: string;

  @ApiProperty({
    description: "License photo URL",
    example: "https://example.com/license.jpg"
  })
  licensePhoto: string;

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
    description: "Pincode",
    example: "400001"
  })
  pincode: string;

  @ApiProperty({
    description: "Additional location details",
    required: false
  })
  location?: string;

  @ApiProperty({
    description: "Latitude",
    example: 19.076090
  })
  latitude: number;

  @ApiProperty({
    description: "Longitude",
    example: 72.877426
  })
  longitude: number;
}
