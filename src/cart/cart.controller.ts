import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(jwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  addToCart(@Body() dto: AddToCartDto, @Req() req) {
    return this.cartService.addToCart(dto, req.user);
  }

  @Patch('update')
  updateCart(@Body() dto: UpdateCartDto, @Req() req) {
    return this.cartService.updateCart(dto, req.user);
  }

  @Get()
  getCart(@Req() req) {
    return this.cartService.getOrCreateCart(req.user);
  }

  @Delete('item/:id')
  removeItem(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.removeItem(id, req.user);
  }
}
