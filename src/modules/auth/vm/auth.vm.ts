import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/modules/roles-permission/entity/roles.entity";

export class UserVm {
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
    description: "Whether the user's email is verified",
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: "Whether the user is approved by admin",
    example: true
  })
  adminApproved: boolean;

  @ApiProperty({
    description: "User's full name (computed property)",
    example: "John Doe"
  })
  fullName?: string;
}

export class AuthResponseVm {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  })
  accessToken: string;

  @ApiProperty({
    description: "User information",
    type: UserVm
  })
  user: UserVm;
}

export class LoginResponseVm {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  })
  token: string;

  @ApiProperty({
    description: "User information",
    type: UserVm
  })
  user: UserVm;

  @ApiProperty({
    description: "Token expiration time in seconds",
    example: 3600
  })
  expiresIn: number;
}

export class RegisterResponseVm {
  @ApiProperty({
    description: "Success message",
    example: "User registered successfully. Please verify your email."
  })
  message: string;

  @ApiProperty({
    description: "User information (excluding sensitive data)",
    type: UserVm
  })
  user: UserVm;
}

export class OtpVerificationVm {
  @ApiProperty({
    description: "Success message",
    example: "OTP verified successfully"
  })
  message: string;

  @ApiProperty({
    description: "JWT access token (if OTP verification is for login)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  })
  accessToken?: string;

  @ApiProperty({
    description: "User information",
    type: UserVm
  })
  user: UserVm;
}

export class PasswordResetVm {
  @ApiProperty({
    description: "Success message",
    example: "Password reset successfully"
  })
  message: string;
}

export class UserSummaryVm {
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
}
