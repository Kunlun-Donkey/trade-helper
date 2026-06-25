import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowLog } from '../../../entities/follow-log.entity';
import { Customer } from '../../../entities/customer.entity';
import { CreateFollowLogDto } from './dto/create-follow-log.dto';

@Injectable()
export class FollowLogService {
  constructor(
    @InjectRepository(FollowLog)
    private followLogRepo: Repository<FollowLog>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async create(userId: number, customerId: number, dto: CreateFollowLogDto) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId, userId },
    });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    const log = this.followLogRepo.create({
      ...dto,
      userId,
      customerId,
    });
    return this.followLogRepo.save(log);
  }

  async findAll(userId: number, customerId: number) {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId, userId },
    });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    const list = await this.followLogRepo.find({
      where: { customerId, userId },
      order: { createTime: 'DESC' },
    });

    return list;
  }

  async findOne(userId: number, id: number) {
    const log = await this.followLogRepo.findOne({
      where: { id, userId },
    });
    if (!log) {
      throw new NotFoundException('跟进记录不存在');
    }
    return log;
  }

  async remove(userId: number, id: number) {
    const log = await this.findOne(userId, id);
    await this.followLogRepo.softDelete(id);
    return log;
  }
}
