import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./product.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entity/product.entity";
import { Shop } from "src/shops/entity/shop.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Shop])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
