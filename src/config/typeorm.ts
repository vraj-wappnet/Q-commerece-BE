import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../auth/entity/user.entity";
import { Otp } from "../auth/entity/otp.entity";
import { Shop } from "../shops/entity/shop.entity";
import { SeederOptions } from "typeorm-extension";
import { Product } from "src/products/entity/product.entity";

config();

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Otp, Shop, Product],
  migrations: ["dist/src/database/migrations/*.js"],
  synchronize: false,
  seeds: ["dist/src/database/seeds/**/*.js"],
  factories: ["dist/src/database/factories/**/*.js"],
};

export default new DataSource(options);
