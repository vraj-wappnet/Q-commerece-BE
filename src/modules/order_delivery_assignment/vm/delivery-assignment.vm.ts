import { ApiProperty } from "@nestjs/swagger";
import { AssignmentStatus } from "src/common/enum/status.enum";
import { OrderStatus } from "src/common/enum/status.enum";

export class DeliveryAssignmentVm {
  @ApiProperty({
    description: "Unique delivery assignment identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Order information",
    type: "object",
    additionalProperties: true,
    required: []
  })
  order?: {
    id: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
  };

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
    description: "Assignment status",
    enum: AssignmentStatus,
    example: AssignmentStatus.PENDING
  })
  status: AssignmentStatus;

  @ApiProperty({
    description: "Date and time when assignment was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;
}

export class DeliveryAssignmentSummaryVm {
  @ApiProperty({
    description: "Assignment ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId: string;

  @ApiProperty({
    description: "Delivery person name",
    example: "John Doe"
  })
  deliveryPersonName: string;

  @ApiProperty({
    description: "Assignment status",
    enum: AssignmentStatus,
    example: AssignmentStatus.PENDING
  })
  status: AssignmentStatus;

  @ApiProperty({
    description: "Order amount",
    example: 299.99
  })
  orderAmount: number;

  @ApiProperty({
    description: "Assignment created time",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;
}

export class DeliveryAssignmentCreateVm {
  @ApiProperty({
    description: "Order ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  orderId: string;

  @ApiProperty({
    description: "Delivery person ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  userId: string;

  @ApiProperty({
    description: "Initial assignment status",
    enum: AssignmentStatus,
    example: AssignmentStatus.PENDING,
    required: false
  })
  status?: AssignmentStatus;
}
