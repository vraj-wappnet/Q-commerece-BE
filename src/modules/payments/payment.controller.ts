import {
  Controller,
  Post,
  Get,
  Req,
  Query,
  Param,
  UseGuards,
  Logger,
  Body,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enum/roles.enum";
import { StripeService } from "src/modules/stripe/stripe.service";
import { PaymentService } from "./payment.service";
import { PaymentStatus } from "src/common/enum/status.enum";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";

@ApiTags("payments")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, RolesGuard)
@Controller("payments")
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private stripeService: StripeService,
    private paymentService: PaymentService,
  ) {}

  @Post('create-payment-intent')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create payment intent for online payment' })
  async createPaymentIntent(
    @Query('amount') amount: string,
    @Query('orderId') orderId: string
  ) {
    try {      
      if (!amount || !orderId) {
        throw new Error('Amount and orderId are required as query parameters');
      }

      const amountNum = parseFloat(amount);
      const orderIdNum = parseInt(orderId);

      if (isNaN(amountNum) || isNaN(orderIdNum)) {
        throw new Error('Amount and orderId must be valid numbers');
      }

      if (amountNum <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const paymentIntent = await this.stripeService.createPaymentIntent(
        amountNum,
        orderIdNum,
      );

      // Save payment transaction to database
      await this.paymentService.createPaymentTransaction({
        orderId: orderId,
        paymentIntentId: paymentIntent.id,
        amount: amountNum,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      throw new Error('No stripe signature');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    const event = this.stripeService.constructWebhookEvent(
      req.body,
      sig,
      webhookSecret,
    );

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as any;
      const orderID = intent.metadata.orderId;
      
      // Update payment transaction status
      await this.paymentService.updatePaymentStatus(
        intent.id,
        PaymentStatus.COMPLETED,
        {
          paymentMethod: intent.payment_method_types?.[0],
          stripeResponse: intent,
        },
      );
      
      return { received: true, orderConfirmed: true };
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as any;
      
      // Update payment transaction status
      await this.paymentService.updatePaymentStatus(
        intent.id,
        PaymentStatus.FAILED,
        {
          failureReason: intent.last_payment_error?.message,
          stripeResponse: intent,
        },
      );
    }

    return { received: true };
  }

  @Get('order/:orderId')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Get payment transaction by order ID' })
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return await this.paymentService.getPaymentByOrderId(orderId);
  }

  @Get('transaction/:paymentIntentId')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Get payment transaction by payment intent ID' })
  async getPaymentByIntentId(@Param('paymentIntentId') paymentIntentId: string) {
    return await this.paymentService.getPaymentByIntentId(paymentIntentId);
  }

  @Post('verify')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Verify payment status with Stripe' })
  async verifyPaymentStatus(@Body() dto: VerifyPaymentDto) {
    return await this.paymentService.verifyPaymentStatus(dto.paymentIntentId);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all payment transactions with filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiQuery({ name: 'orderId', required: false, description: 'Filter by order ID' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter from date' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter to date' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getAllPayments(@Query() query: any) {
    return await this.paymentService.getAllPayments(query);
  }
}
