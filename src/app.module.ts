import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./modules/auth/entity/user.entity";
import { Otp } from "./modules/auth/entity/otp.entity";
import { Shop } from "./modules/shops/entity/shop.entity";
import { Product } from "./modules/products/entity/product.entity";
import { Category } from "./modules/categories/entity/category.entity";
import { SubCategory } from "./modules/categories/entity/sub-category.entity";
import { Notification } from "./modules/notifications/entity/notification.entity";
import { Order } from "./modules/orders/entity/order.entity";
import { OrderItem } from "./modules/orders/entity/order-item.entity";
import { Cart } from "./modules/cart/entity/cart.entity";
import { DeliveryProfile } from "./modules/delivery_profiles/entity/delivery-profile.entity";
import { DeliveryAssignment } from "./modules/order_delivery_assignment/entity/delivery_assignment.entity";
import { AuthModule } from "./modules/auth/auth.module";
import configuration from "./config/configuration";
import { BullModule } from "@nestjs/bullmq";
import { MediaModule } from "./modules/media/media.module";
import { UsersModule } from "./modules/users/users.module";
import { AdminModule } from "./admin/admin.module";
import { ShopModule } from "./modules/shops/shops.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { OrdersNodule } from "./modules/orders/orders.module";
import { NotificationModule } from "./modules/notifications/notification.module";
import { QueueModule } from "./queue/queue.module";
import { DeliveryProfileModule } from "./modules/delivery_profiles/delivery-profile.module";
import { DeliveryQueueModule } from "./modules/order_delivery_assignment/delivery_assignment.module";
import { PaymentModule } from "./modules/payments/payment.module";
import { RolesPermissionModule } from "./modules/roles-permission/roles.module";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("database.host"),
        port: config.get<number>("database.port"),
        username: config.get<string>("database.username"),
        password: config.get<string>("database.password"),
        database: config.get<string>("database.name"),
        autoLoadEntities: true,
        entities: [
          User,
          Otp,
          Shop,
          Product,
          Category,
          SubCategory,
          Notification,
          Order,
          OrderItem,
          Cart,
          DeliveryProfile,
          DeliveryAssignment,
        ],
        synchronize: false,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("redis.host"),
          port: config.get<number>("redis.port"),
        },
      }),
    }),

    AuthModule,
    MediaModule,
    UsersModule,
    AdminModule,
    ShopModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersNodule,
    NotificationModule,
    QueueModule,
    DeliveryProfileModule,
    DeliveryQueueModule,
    PaymentModule,
    RolesPermissionModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
