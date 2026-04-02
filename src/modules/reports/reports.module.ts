import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportCron } from './report.cron';
import { User } from '../auth/entity/user.entity';
import { Order } from '../orders/entity/order.entity';
import { Product } from '../products/entity/product.entity';
import { Category } from '../categories/entity/category.entity';
import { SubCategory } from '../categories/entity/sub-category.entity';
import { Shop } from '../shops/entity/shop.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Product, Category, SubCategory, Shop]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportCron],
})
export class ReportModule {}
