import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../entities/customer.entity';
import { FollowLog } from '../../entities/follow-log.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { FollowLogController } from './follow-log/follow-log.controller';
import { FollowLogService } from './follow-log/follow-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, FollowLog])],
  controllers: [CustomerController, FollowLogController],
  providers: [CustomerService, FollowLogService],
  exports: [CustomerService, FollowLogService],
})
export class CustomerModule {}
