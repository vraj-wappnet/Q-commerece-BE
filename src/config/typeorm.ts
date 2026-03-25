import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../auth/entity/user.entity";
import { Otp } from "../auth/entity/otp.entity";
import { Shop } from "../shops/entity/shop.entity";
import { SeederOptions } from "typeorm-extension";
import { Product } from "src/products/entity/product.entity";
import { CartItem } from "src/cart/entity/cart-item.entity";
import { Cart } from "src/cart/entity/cart.entity";
import { Category } from "src/categories/entity/category.entity";
import { SubCategory } from "src/categories/entity/sub-category.entity";
import { Order } from "src/orders/entity/order.entity";
import { OrderItem } from "src/orders/entity/order-item.entity";
import { DeliveryProfile } from "src/delivery_profiles/entity/delivery-profile.entity";
import { DeliveryAssignment } from "src/order_delivery_assignment/entity/delivery_assignment.entity";
import { Notification } from "../notifications/entity/notification.entity";

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
  migrations: ["dist/src/database/migrations/*.js"],
  synchronize: false,
  seeds: ["dist/src/database/seeds/**/*.js"],
  factories: ["dist/src/database/factories/**/*.js"],
};

export default new DataSource(options);
