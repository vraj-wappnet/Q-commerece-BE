import { ApiProperty } from "@nestjs/swagger";

export class CartItemVm {
  @ApiProperty({
    description: "Unique cart item identifier",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "Product details",
    type: "object",
    additionalProperties: true
  })
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };

  @ApiProperty({
    description: "Quantity of the product in cart",
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: "Price per item",
    example: 99.99
  })
  price: number;

  @ApiProperty({
    description: "Total price for this cart item (quantity × price)",
    example: 199.98
  })
  totalPrice: number;
}

export class CartVm {
  @ApiProperty({
    description: "Unique cart identifier",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "User information",
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
    description: "List of items in the cart",
    type: [CartItemVm]
  })
  items: CartItemVm[];

  @ApiProperty({
    description: "Total amount for all items in cart",
    example: 299.99
  })
  totalAmount: number;

  @ApiProperty({
    description: "Total number of items in cart",
    example: 3
  })
  totalItems: number;

  @ApiProperty({
    description: "Whether the cart is currently active",
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: "Date and time when cart was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date and time when cart was last updated",
    example: "2024-01-15T11:00:00Z"
  })
  updatedAt: Date;
}

export class CartSummaryVm {
  @ApiProperty({
    description: "Cart ID",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "Total amount",
    example: 299.99
  })
  totalAmount: number;

  @ApiProperty({
    description: "Total items",
    example: 3
  })
  totalItems: number;

  @ApiProperty({
    description: "Cart status",
    example: true
  })
  isActive: boolean;
}
