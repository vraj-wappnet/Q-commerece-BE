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
import { RolesGuard } from "src/common/guards/roles.guard";
import { ProductsService } from "./products.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { User } from "src/auth/entity/user.entity";
import { UserRole } from "src/common/enum/roles.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { FilterProductDto } from "./dto/filter-product.dto";

@ApiTags("products")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, RolesGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  createProduct(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productService.createProduct(dto, req.user as User);
  }

  @Get("all")
  getAllProducts(@Query() query: FilterProductDto) {
    return this.productService.getAllProducts(query);
  }

  @Get(":id")
  getProductById(@Param("id") id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  updateProduct(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productService.updateProduct(id, dto, req.user as User);
  }

  @Delete(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  deleteProduct(@Param("id") id: string, @Req() req: any) {
    return this.productService.deleteProduct(id, req.user as User);
  }
}
