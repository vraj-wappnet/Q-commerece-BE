import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { UserRole } from "src/common/enum/roles.enum";

const booleanTransform = ({ value }: { value: unknown }) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return value;
};

export class GetUsersQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: "john",
    description:
      "Matches firstName, lastName, email, or mobile (case-insensitive)",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: [
      UserRole.ADMIN,
      UserRole.SELLER,
      UserRole.DELIVERY,
      UserRole.CUSTOMER,
    ],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([UserRole.ADMIN, UserRole.SELLER, UserRole.DELIVERY, UserRole.CUSTOMER])
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(booleanTransform)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(booleanTransform)
  @IsBoolean()
  adminApproved?: boolean;

  @ApiPropertyOptional({
    enum: [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "role",
      "isVerified",
      "adminApproved",
    ],
    default: "email",
  })
  @IsOptional()
  @IsIn([
    "firstName",
    "lastName",
    "email",
    "mobile",
    "role",
    "isVerified",
    "adminApproved",
  ])
  sortBy?:
    | "firstName"
    | "lastName"
    | "email"
    | "mobile"
    | "role"
    | "isVerified"
    | "adminApproved" = "email";

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], default: "ASC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "ASC";
}
