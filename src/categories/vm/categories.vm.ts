import { ApiProperty } from "@nestjs/swagger";

export class SubCategoryVm {
  @ApiProperty({
    description: "Unique sub-category identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Sub-category name",
    example: "Laptops"
  })
  name: string;

  @ApiProperty({
    description: "Parent category information",
    type: "object",
    additionalProperties: true
  })
  category?: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: "Date and time when sub-category was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date and time when sub-category was last updated",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;
}

export class CategoryVm {
  @ApiProperty({
    description: "Unique category identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Category name",
    example: "Electronics"
  })
  name: string;

  @ApiProperty({
    description: "List of sub-categories in this category",
    type: [SubCategoryVm]
  })
  subCategories: SubCategoryVm[];

  @ApiProperty({
    description: "Date and time when category was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date and time when category was last updated",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;
}

export class CategorySummaryVm {
  @ApiProperty({
    description: "Category ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Category name",
    example: "Electronics"
  })
  name: string;

  @ApiProperty({
    description: "Number of sub-categories in this category",
    example: 5
  })
  subCategoryCount: number;
}

export class SubCategorySummaryVm {
  @ApiProperty({
    description: "Sub-category ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Sub-category name",
    example: "Laptops"
  })
  name: string;

  @ApiProperty({
    description: "Parent category name",
    example: "Electronics"
  })
  categoryName: string;
}
