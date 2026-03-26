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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { FilterCartDto } from './dto/filter-cart.dto';
import { jwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/roles.enum';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.CUSTOMER)
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

  @Get('all')
  @Roles(UserRole.ADMIN)
  getAllCarts(@Query() query: FilterCartDto) {
    return this.cartService.getAllCarts(query);
  }

  @Delete('item/:id')
  removeItem(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cartService.removeItem(id, req.user);
  }
}
