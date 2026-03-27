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
import { PermissionGuard } from "src/modules/roles-permission/permission.guard";
import { Permission } from "src/modules/roles-permission/permissions.decorator";
import { ProductsService } from "./products.service";
import { User } from "src/modules/auth/entity/user.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { FilterProductDto } from "./dto/filter-product.dto";

@ApiTags("products")
@ApiBearerAuth()
@UseGuards(jwtAuthGuard, PermissionGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @Permission("CREATE_PRODUCT")
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
  @Permission("UPDATE_PRODUCT")
  updateProduct(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productService.updateProduct(id, dto, req.user as User);
  }

  @Delete(":id")
  @Permission("DELETE_PRODUCT")
  deleteProduct(@Param("id") id: string, @Req() req: any) {
    return this.productService.deleteProduct(id, req.user as User);
  }
}
