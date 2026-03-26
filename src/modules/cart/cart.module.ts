import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { Cart } from "./entity/cart.entity";
import { CartItem } from "./entity/cart-item.entity";
import { Product } from "src/modules/products/entity/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
