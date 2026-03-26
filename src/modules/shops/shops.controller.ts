import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ShopsService } from "./shops.service";
import { CreateShopDto } from "./dto/create-shop.dto";
import { updateShopDto } from "./dto/update-shop.dto";
import { FilterShopDto } from "./dto/filter-shop.dto";

@ApiTags("shops")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard)
@Controller("shops")
export class ShopController {
  constructor(private readonly shopService: ShopsService) {}

  @Post("register")
  createShop(@Body() dto: CreateShopDto, @Req() req) {
    return this.shopService.createShop(dto, req.user.id);
  }

  @Patch(":id")
  updateshop(@Param("id") id: string, @Body() dto: updateShopDto, @Req() req) {
    return this.shopService.updateShop(dto, id, req.user);
  }

  @Get("all")
  getAllShops(@Query() query: FilterShopDto) {
    return this.shopService.getAllShops(query);
  }

  @Get(":id")
  getShopById(@Param("id") id: string) {
    return this.shopService.getShopById(id);
  }

  @Delete(":id")
  deleteShop(@Param(":id") id: string, @Req() req) {
    return this.shopService.deleteShop(id, req.user);
  }
}
