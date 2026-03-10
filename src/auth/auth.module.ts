import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/auth/entity/user.entity";
import { Otp } from "src/auth/entity/otp.entity";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { MailModule } from "src/mail/mail.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>("jwt.secret"),
        signOptions: {
          expiresIn: config.get<string>("jwt.expiresIn") as NonNullable<
            JwtModuleOptions["signOptions"]
          >["expiresIn"],
        },
      }),
    }),

    BullModule.registerQueue({
      name: "emailQueue",
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
