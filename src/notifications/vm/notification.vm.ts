import { ApiProperty } from "@nestjs/swagger";
import { NotificationType } from "src/common/enum/status.enum";

export class NotificationVm {
  @ApiProperty({
    description: "Unique notification identifier",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

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
  };

  @ApiProperty({
    description: "Notification title",
    example: "Order Delivered"
  })
  title: string;

  @ApiProperty({
    description: "Notification message",
    example: "Your order #12345 has been successfully delivered."
  })
  message: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.ORDER_STATUS
  })
  type: NotificationType;

  @ApiProperty({
    description: "Whether notification has been read",
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: "Date and time when notification was created",
    example: "2024-01-15T10:30:00Z"
  })
  createdAt: Date;

  @ApiProperty({
    description: "Formatted time ago string",
    example: "2 hours ago"
  })
  timeAgo?: string;
}

export class NotificationSummaryVm {
  @ApiProperty({
    description: "Notification ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  id: string;

  @ApiProperty({
    description: "Notification title",
    example: "Order Delivered"
  })
  title: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.ORDER_STATUS
  })
  type: NotificationType;

  @ApiProperty({
    description: "Read status",
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: "Time ago format",
    example: "2 hours ago"
  })
  timeAgo?: string;
}

export class NotificationCreateVm {
  @ApiProperty({
    description: "User ID to send notification to",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  userId: string;

  @ApiProperty({
    description: "Notification title",
    example: "Order Delivered"
  })
  title: string;

  @ApiProperty({
    description: "Notification message",
    example: "Your order #12345 has been successfully delivered."
  })
  message: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.ORDER_STATUS
  })
  type: NotificationType;
}

export class NotificationCountVm {
  @ApiProperty({
    description: "Total unread notifications count",
    example: 5
  })
  unreadCount: number;

  @ApiProperty({
    description: "Total notifications count",
    example: 12
  })
  totalCount: number;
}
