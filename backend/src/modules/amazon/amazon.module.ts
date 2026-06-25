import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmazonController } from './amazon.controller';
import { AmazonService } from './amazon.service';
import { AmazonData } from '../../entities/amazon-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmazonData])],
  controllers: [AmazonController],
  providers: [AmazonService],
  exports: [AmazonService],
})
export class AmazonModule {}
