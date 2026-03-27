import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/modules/roles-permission/entity/roles.entity";

export class UserProfileVm {
  @ApiProperty({
    description: "Unique user identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "User's first name",
    example: "John"
  })
  firstName: string;

  @ApiProperty({
    description: "User's last name",
    example: "Doe"
  })
  lastName: string;

  @ApiProperty({
    description: "User's email address",
    example: "john.doe@example.com"
  })
  email: string;

  @ApiProperty({
    description: "User's mobile number",
    example: "+1234567890"
  })
  mobile: string;

  @ApiProperty({
    description: "User's role",
    enum: Role,
    example: { id: 3, name: "CUSTOMER", description: "Regular customer with basic access" }
  })
  role: Role;

  @ApiProperty({
    description: "Whether the user has verified their email",
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: "Whether the user is approved by admin",
    example: true
  })
  adminApproved: boolean;

  @ApiProperty({
    description: "User's full name",
    example: "John Doe"
  })
  fullName: string;

  @ApiProperty({
    description: "User's profile completion percentage",
    example: 75
  })
  profileCompletion?: number;

  @ApiProperty({
    description: "User's avatar or profile picture",
    example: "https://example.com/avatar.jpg",
    required: false
  })
  avatar?: string;

  @ApiProperty({
    description: "User's date of birth",
    example: "1990-01-15",
    required: false
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: "User's gender",
    example: "male",
    required: false
  })
  gender?: string;

  @ApiProperty({
    description: "User's bio or description",
    example: "Passionate about organic food and healthy living.",
    required: false
  })
  bio?: string;

  @ApiProperty({
    description: "User registration date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "User last login date",
    example: "2024-01-20T15:30:00Z",
    required: false
  })
  lastLoginAt?: Date;
}

export class UserPublicVm {
  @ApiProperty({
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Display name",
    example: "John Doe"
  })
  displayName: string;

  @ApiProperty({
    description: "User avatar",
    example: "https://example.com/avatar.jpg",
    required: false
  })
  avatar?: string;

  @ApiProperty({
    description: "User bio",
    example: "Passionate about organic food.",
    required: false
  })
  bio?: string;

  @ApiProperty({
    description: "User location",
    example: "Mumbai, India",
    required: false
  })
  location?: string;

  @ApiProperty({
    description: "User join date",
    example: "2024-01-15T10:30:00Z"
  })
  joinedAt: Date;

  @ApiProperty({
    description: "User role",
    enum: Role,
    example: { id: 3, name: "CUSTOMER", description: "Regular customer with basic access" }
  })
  role: Role;
}

export class UserAdminVm {
  @ApiProperty({
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "User's full name",
    example: "John Doe"
  })
  fullName: string;

  @ApiProperty({
    description: "User's email address",
    example: "john.doe@example.com"
  })
  email: string;

  @ApiProperty({
    description: "User's mobile number",
    example: "+1234567890"
  })
  mobile: string;

  @ApiProperty({
    description: "User's role",
    enum: Role,
    example: { id: 3, name: "CUSTOMER", description: "Regular customer with basic access" }
  })
  role: Role;

  @ApiProperty({
    description: "Verification status",
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: "Admin approval status",
    example: true
  })
  adminApproved: boolean;

  @ApiProperty({
    description: "Account status",
    example: "Active"
  })
  status: string;

  @ApiProperty({
    description: "Registration date",
    example: "2024-01-15T10:30:00Z"
  })
  registrationDate: Date;

  @ApiProperty({
    description: "Last login date",
    example: "2024-01-20T15:30:00Z",
    required: false
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: "Order count",
    example: 15
  })
  orderCount?: number;

  @ApiProperty({
    description: "Total spent amount",
    example: 2999.99
  })
  totalSpent?: number;
}

export class UserUpdateVm {
  @ApiProperty({
    description: "User's first name",
    example: "John",
    required: false
  })
  firstName?: string;

  @ApiProperty({
    description: "User's last name",
    example: "Doe",
    required: false
  })
  lastName?: string;

  @ApiProperty({
    description: "User's mobile number",
    example: "+1234567890",
    required: false
  })
  mobile?: string;

  @ApiProperty({
    description: "User's date of birth",
    example: "1990-01-15",
    required: false
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: "User's gender",
    example: "male",
    required: false
  })
  gender?: string;

  @ApiProperty({
    description: "User's bio",
    example: "Passionate about organic food and healthy living.",
    required: false
  })
  bio?: string;

  @ApiProperty({
    description: "User's avatar",
    example: "https://example.com/avatar.jpg",
    required: false
  })
  avatar?: string;
}

export class UserListVm {
  @ApiProperty({
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Display name",
    example: "John Doe"
  })
  displayName: string;

  @ApiProperty({
    description: "Email address",
    example: "john.doe@example.com"
  })
  email: string;

  @ApiProperty({
    description: "Mobile number",
    example: "+1234567890"
  })
  mobile: string;

  @ApiProperty({
    description: "User role",
    enum: Role,
    example: { id: 3, name: "CUSTOMER", description: "Regular customer with basic access" }
  })
  role: Role;

  @ApiProperty({
    description: "Verification status",
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: "Admin approval status",
    example: true
  })
  adminApproved: boolean;

  @ApiProperty({
    description: "Registration date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last login date",
    example: "2024-01-20T15:30:00Z",
    required: false
  })
  lastLoginAt?: Date;
}
