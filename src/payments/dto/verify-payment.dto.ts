import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_3MtwBwLkdIwHu7ix28a3tqPa',
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;
}
