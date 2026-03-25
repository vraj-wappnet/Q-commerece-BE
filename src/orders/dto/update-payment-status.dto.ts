import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { PaymentStatus } from "src/common/enum/status.enum";

export class UpdatePaymentStatusDto {
  @ApiProperty({ 
    enum: PaymentStatus,
    description: "Payment status of the order",
    example: PaymentStatus.COMPLETED
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
