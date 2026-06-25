import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Customer } from '../../entities/customer.entity';
import { OrderPay } from '../../entities/order-pay.entity';
import { Invoice } from '../../entities/invoice.entity';
import { FollowLog } from '../../entities/follow-log.entity';
import { AmazonData } from '../../entities/amazon-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, OrderPay, Invoice, FollowLog, AmazonData])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
