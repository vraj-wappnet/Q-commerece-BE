import { Module } from "@nestjs/common";
import { Order } from "./entity/order.entity";
import { OrderService } from "./orders.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderItem } from "./entity/order-item.entity";
import { Cart } from "src/cart/entity/cart.entity";
import { CartItem } from "src/cart/entity/cart-item.entity";
import { Product } from "src/products/entity/product.entity";
import { DeliveryProfile } from "src/delivery_profiles/entity/delivery-profile.entity";
import { orderController } from "./orders.controller";
import { NotificationModule } from "../notifications/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem, Product, DeliveryProfile]),
    NotificationModule
  ],
  providers: [OrderService],
  controllers: [orderController],
})
export class OrdersNodule {}
