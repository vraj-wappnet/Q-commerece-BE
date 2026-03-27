import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiBody, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PermissionGuard } from "src/modules/roles-permission/permission.guard";
import { Permission } from "src/modules/roles-permission/permissions.decorator";
import { OrderService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { cancelOrderDto } from "./dto/cancel-order.dto";
import { TrackOrderVm } from "./vm/track-order.vm";
import { FilterOrderDto } from "./dto/filter-order.dto";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, PermissionGuard)
@Controller("orders")
export class orderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @Permission("CREATE_ORDER")
  @ApiBody({ type: CreateOrderDto })
  createOrder(@Body() dto: CreateOrderDto, @Req() req) {
    return this.orderService.createOrder(dto, req.user);
  }

  @Get("my")
  @Permission("READ_ORDER")
  getMyOrders(@Req() req) {
    return this.orderService.getMyOrders(req.user);
  }

  @Get("All")
  @Permission("READ_ORDER")
  @ApiQuery({ type: FilterOrderDto })
  getAllOrders(@Query() query?: FilterOrderDto) {
    return this.orderService.getAllOrders(query);
  }

  @Get("seller")
  @Permission("READ_ORDER")
  getSellerOrders(@Req() req) {
    return this.orderService.getSellerOrder(req.user);
  }

  @Get(":id")
  @Permission("READ_ORDER")
  getOrderById(@Req() req, @Param("id", new ParseUUIDPipe()) id: string) {
    return this.orderService.getOrderById(id, req.user);
  }

  @Patch(":id/status")
  @Permission("UPDATE_ORDER")
  @ApiBody({ type: UpdateOrderStatusDto })
  updateOrderStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }

  @Patch(":id/payment-status")
  @Permission("UPDATE_ORDER")
  @ApiBody({ type: UpdatePaymentStatusDto })
  updatePaymentStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.orderService.updatePaymentStatus(id, dto.paymentStatus);
  }

  @Patch(":id/cancel")
  @Permission("DELETE_ORDER")
  @ApiBody({ type: cancelOrderDto })
  cancelOrder(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req,
    @Body() dto: cancelOrderDto,
  ) {
    return this.orderService.cancelOrder(id, req.user, dto.reason || "");
  }

  @Patch(":id/assign-delivery")
  @Permission("MANAGE_DELIVERY")
  assignDelivery(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.orderService.assignDeliveryPerson(id);
  }

  @Get("invoice/:id")
  @Permission("READ_ORDER")
  async generateInvoice(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.orderService.generateInvoice(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  }

  @Patch('delivery/:id/accept')
  @Permission("MANAGE_DELIVERY")
  acceptDelivery(@Param('id', new ParseUUIDPipe()) id: string, @Req() req) {
    return this.orderService.acceptDelivery(id, req.user);
  }

  @Patch('delivery/:id/reject')
  @Permission("MANAGE_DELIVERY")
  rejectDelivery(@Param('id', new ParseUUIDPipe()) id: string, @Req() req) {
    return this.orderService.rejectDelivery(id, req.user);
  }
}

@ApiTags("orders")
@UseGuards(jwtAuthGuard, PermissionGuard)
@Controller("orders")
export class orderTrackingController {
  constructor(private orderService: OrderService) {}

  @Get("track/:id")
  @Permission("READ_ORDER")
  async trackOrder(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const html = await this.orderService.renderOrderTrackingPage(id);

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
    });

    return res.send(html);
  }

  @Get("track/:id/json")
  @Permission("READ_ORDER")
  @ApiOkResponse({ type: TrackOrderVm })
  trackOrderJson(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.orderService.getTrackOrderVm(id);
  }
}
