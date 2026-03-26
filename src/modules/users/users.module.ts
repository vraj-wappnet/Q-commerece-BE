import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/modules/auth/entity/user.entity";
import { UsersController } from "./users.controller";
import { userServices } from "./users.service";

import { AuthModule } from "src/modules/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UsersController],
  providers: [userServices],
  exports: [userServices],
})
export class UsersModule {}
