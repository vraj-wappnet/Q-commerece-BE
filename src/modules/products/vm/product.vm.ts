import { ApiProperty } from "@nestjs/swagger";

export class ProductVm {
  @ApiProperty({
    description: "Unique product identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Product name",
    example: "Fresh Organic Apples"
  })
  name: string;

  @ApiProperty({
    description: "Product description",
    example: "Fresh organic apples from local farms",
    required: false
  })
  description?: string;

  @ApiProperty({
    description: "Detailed product description",
    example: "These apples are grown without pesticides and are perfect for daily consumption.",
    required: false
  })
  longDescription?: string;

  @ApiProperty({
    description: "Pricing information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  pricing: {
    mrp: number;
    sellingPrice: number;
    discountPercentage?: number;
    discountAmount?: number;
    youSave?: number;
  };

  @ApiProperty({
    description: "Inventory information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  inventory: {
    stockQuantity: number;
    isAvailable: boolean;
    lowStockThreshold?: number;
    stockStatus: string;
  };

  @ApiProperty({
    description: "Product unit information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  unit: {
    unit: string;
    unitValue?: number;
    packSize?: string;
  };

  @ApiProperty({
    description: "Product images",
    type: [String],
    example: ["https://example.com/apple1.jpg", "https://example.com/apple2.jpg"]
  })
  images: string[];

  @ApiProperty({
    description: "Category information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  category?: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: "Sub-category information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  subCategory?: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: "Product brand",
    example: "Organic Farms",
    required: false
  })
  brand?: string;

  @ApiProperty({
    description: "Product type",
    example: true
  })
  isVeg: boolean;

  @ApiProperty({
    description: "Expiry information",
    example: 30,
    required: false
  })
  expiryDays?: number;

  @ApiProperty({
    description: "Shop information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  shop: {
    id: string;
    shopName: string;
    addressLine1: string;
    city: string;
    state: string;
  };

  @ApiProperty({
    description: "Product creation date",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Product last update date",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;
}

export class ProductSummaryVm {
  @ApiProperty({
    description: "Product ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Product name",
    example: "Fresh Organic Apples"
  })
  name: string;

  @ApiProperty({
    description: "Product images",
    type: [String],
    example: ["https://example.com/apple1.jpg"]
  })
  images: string[];

  @ApiProperty({
    description: "Pricing",
    type: "object",
    additionalProperties: true,
    required: []
  })
  pricing: {
    sellingPrice: number;
    mrp: number;
    discountPercentage?: number;
  };

  @ApiProperty({
    description: "Stock status",
    example: "In Stock"
  })
  stockStatus: string;

  @ApiProperty({
    description: "Availability",
    example: true
  })
  isAvailable: boolean;

  @ApiProperty({
    description: "Shop name",
    example: "Organic Store"
  })
  shopName: string;

  @ApiProperty({
    description: "Category name",
    example: "Fruits",
    required: false
  })
  categoryName?: string;
}

export class ProductCreateVm {
  @ApiProperty({
    description: "Product name",
    example: "Fresh Organic Apples"
  })
  name: string;

  @ApiProperty({
    description: "Product description",
    example: "Fresh organic apples from local farms",
    required: false
  })
  description?: string;

  @ApiProperty({
    description: "Detailed product description",
    example: "These apples are grown without pesticides...",
    required: false
  })
  longDescription?: string;

  @ApiProperty({
    description: "Maximum retail price",
    example: 99.99
  })
  mrp: number;

  @ApiProperty({
    description: "Selling price",
    example: 79.99
  })
  sellingPrice: number;

  @ApiProperty({
    description: "Discount percentage",
    example: 20,
    required: false
  })
  discountPercentage?: number;

  @ApiProperty({
    description: "Stock quantity",
    example: 100
  })
  stockQuantity: number;

  @ApiProperty({
    description: "Low stock threshold",
    example: 10,
    required: false
  })
  lowStockThreshold?: number;

  @ApiProperty({
    description: "Unit type",
    example: "kg"
  })
  unit: string;

  @ApiProperty({
    description: "Unit value",
    example: 1,
    required: false
  })
  unitValue?: number;

  @ApiProperty({
    description: "Pack size",
    example: "1kg pack",
    required: false
  })
  packSize?: string;

  @ApiProperty({
    description: "Category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false
  })
  categoryId?: string;

  @ApiProperty({
    description: "Sub-category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false
  })
  subCategoryId?: string;

  @ApiProperty({
    description: "Brand name",
    example: "Organic Farms",
    required: false
  })
  brand?: string;

  @ApiProperty({
    description: "Is vegetarian",
    example: true
  })
  isVeg: boolean;

  @ApiProperty({
    description: "Expiry days",
    example: 30,
    required: false
  })
  expiryDays?: number;

  @ApiProperty({
    description: "Product images",
    type: [String],
    example: ["https://example.com/apple1.jpg"]
  })
  images?: string[];

  @ApiProperty({
    description: "Shop ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  shopId: string;
}

export class ProductUpdateVm {
  @ApiProperty({
    description: "Product name",
    example: "Fresh Organic Apples",
    required: false
  })
  name?: string;

  @ApiProperty({
    description: "Product description",
    example: "Fresh organic apples from local farms",
    required: false
  })
  description?: string;

  @ApiProperty({
    description: "Detailed product description",
    example: "These apples are grown without pesticides...",
    required: false
  })
  longDescription?: string;

  @ApiProperty({
    description: "Maximum retail price",
    example: 99.99,
    required: false
  })
  mrp?: number;

  @ApiProperty({
    description: "Selling price",
    example: 79.99,
    required: false
  })
  sellingPrice?: number;

  @ApiProperty({
    description: "Discount percentage",
    example: 20,
    required: false
  })
  discountPercentage?: number;

  @ApiProperty({
    description: "Stock quantity",
    example: 100,
    required: false
  })
  stockQuantity?: number;

  @ApiProperty({
    description: "Low stock threshold",
    example: 10,
    required: false
  })
  lowStockThreshold?: number;

  @ApiProperty({
    description: "Unit type",
    example: "kg",
    required: false
  })
  unit?: string;

  @ApiProperty({
    description: "Unit value",
    example: 1,
    required: false
  })
  unitValue?: number;

  @ApiProperty({
    description: "Pack size",
    example: "1kg pack",
    required: false
  })
  packSize?: string;

  @ApiProperty({
    description: "Category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false
  })
  categoryId?: string;

  @ApiProperty({
    description: "Sub-category ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false
  })
  subCategoryId?: string;

  @ApiProperty({
    description: "Brand name",
    example: "Organic Farms",
    required: false
  })
  brand?: string;

  @ApiProperty({
    description: "Is vegetarian",
    example: true,
    required: false
  })
  isVeg?: boolean;

  @ApiProperty({
    description: "Expiry days",
    example: 30,
    required: false
  })
  expiryDays?: number;

  @ApiProperty({
    description: "Product images",
    type: [String],
    example: ["https://example.com/apple1.jpg"],
    required: false
  })
  images?: string[];

  @ApiProperty({
    description: "Availability status",
    example: true,
    required: false
  })
  isAvailable?: boolean;
}
