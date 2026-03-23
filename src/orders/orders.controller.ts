import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiBody } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { OrderService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enum/roles.enum";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { cancelOrderDto } from "./dto/cancel-order.dto";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, RolesGuard)
@Controller("orders")
export class orderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiBody({ type: CreateOrderDto })
  createOrder(@Body() dto: CreateOrderDto, @Req() req) {
    return this.orderService.createOrder(dto, req.user);
  }

  @Get("my")
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  getMyOrders(@Req() req) {
    return this.orderService.getMyOrders(req.user);
  }

  @Get("All")
  @Roles(UserRole.ADMIN)
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get("seller")
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  getSellerOrders(@Req() req) {
    console.log('=== SELLER ORDERS ACCESS ===');
    console.log('User accessing seller orders:', {
      userId: req.user.id,
      userRole: req.user.role,
      userRoleType: typeof req.user.role,
      firstName: req.user.firstName,
      email: req.user.email,
      isVerified: req.user.isVerified,
      adminApproved: req.user.adminApproved,
      requiredRoles: [UserRole.ADMIN, UserRole.SELLER]
    });
    return this.orderService.getSellerOrder(req.user);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  getOrderById(@Req() req, @Param("id") id: number) {
    return this.orderService.getOrderById(id, req.user);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.DELIVERY)
  @ApiBody({ type: UpdateOrderStatusDto })
  updateOrderStatus(
    @Param("id") id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }

  @Patch(":id/cancel")
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiBody({ type: cancelOrderDto })
  cancelOrder(
    @Param("id") id: number,
    @Req() req,
    @Body() dto: cancelOrderDto,
  ) {
    return this.orderService.cancelOrder(id, req.user, dto.reason || "");
  }

  @Patch(":id/assign-delivery")
  @Roles(UserRole.ADMIN)
  assignDelivery(@Param("id") id: number) {
    return this.orderService.assignDeliveryPerson(+id);
  }

  @Get("invoice/:id")
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async generateInvoice(@Param("id") id: number, @Res() res: Response) {
    const pdfBuffer = await this.orderService.generateInvoice(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  }

  @Patch('delivery/:id/accept')
  @Roles(UserRole.DELIVERY)
  acceptDelivery(@Param('id') id: string , @Req() req) {
    return this.orderService.acceptDelivery(parseInt(id), req.user);
  }

  @Patch('delivery/:id/reject')
  @Roles(UserRole.DELIVERY)
  rejectDelivery(@Param('id') id:string ,@Req() req){
    return this.orderService.rejectDelivery(parseInt(id), req.user);
  }
}
