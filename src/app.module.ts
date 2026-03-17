import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./auth/entity/user.entity";
import { Otp } from "./auth/entity/otp.entity";
import { Shop } from "./shops/entity/shop.entity";
import { AuthModule } from "./auth/auth.module";
import configuration from "./config/configuration";
import { BullModule } from "@nestjs/bullmq";
import { MediaModule } from "./media/media.module";
import { UsersModule } from "./users/users.module";
import { AdminModule } from "./admin/admin.module";
import { ShopModule } from "./shops/shops.module";

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
        entities: [User, Otp, Shop],
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
  ],
})
export class AppModule {}
