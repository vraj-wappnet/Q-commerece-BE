import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { Category } from "./entity/category.entity";
import { SubCategory } from "./entity/sub-category.entity";
import { Product } from "src/modules/products/entity/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory, Product])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

