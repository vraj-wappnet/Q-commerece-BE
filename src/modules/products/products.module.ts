import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./product.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entity/product.entity";
import { Shop } from "src/modules/shops/entity/shop.entity";
import { Category } from "src/modules/categories/entity/category.entity";
import { SubCategory } from "src/modules/categories/entity/sub-category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Shop, Category, SubCategory])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
