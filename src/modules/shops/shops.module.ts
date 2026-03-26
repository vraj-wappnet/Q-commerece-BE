import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shop } from "./entity/shop.entity";
import { ShopsService } from "./shops.service";
import { ShopController } from "./shops.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  providers: [ShopsService],
  controllers: [ShopController],
})
export class ShopModule {}
