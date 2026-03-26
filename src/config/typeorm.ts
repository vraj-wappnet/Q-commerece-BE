import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../modules/auth/entity/user.entity";
import { Otp } from "../modules/auth/entity/otp.entity";
import { Shop } from "../modules/shops/entity/shop.entity";
import { SeederOptions } from "typeorm-extension";
import { Product } from "src/modules/products/entity/product.entity";
import { CartItem } from "src/modules/cart/entity/cart-item.entity";
import { Cart } from "src/modules/cart/entity/cart.entity";
import { Category } from "src/modules/categories/entity/category.entity";
import { SubCategory } from "src/modules/categories/entity/sub-category.entity";
import { Order } from "src/modules/orders/entity/order.entity";
import { OrderItem } from "src/modules/orders/entity/order-item.entity";
import { DeliveryProfile } from "src/modules/delivery_profiles/entity/delivery-profile.entity";
import { DeliveryAssignment } from "src/modules/order_delivery_assignment/entity/delivery_assignment.entity";
import { Notification } from "../modules/notifications/entity/notification.entity";

config();

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Otp,
    Shop,
    Product,
    Cart,
    CartItem,
    Category,
    SubCategory,
    Order,
    OrderItem,
    DeliveryProfile,
    DeliveryAssignment,
    Notification,
  ],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
  seeds: ["dist/src/database/seeds/**/*.ts"],
  factories: ["dist/src/database/factories/**/*.ts"],
};

export default new DataSource(options);
