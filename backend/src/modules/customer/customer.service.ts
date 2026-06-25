import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async create(userId: number, dto: CreateCustomerDto) {
    const customer = this.customerRepo.create({
      ...dto,
      userId,
    });
    return this.customerRepo.save(customer);
  }

  async findAll(
    userId: number,
    query: {
      page?: number;
      pageSize?: number;
      search?: string;
      intentLevel?: string;
      customerType?: string;
    },
  ) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const qb = this.customerRepo.createQueryBuilder('customer')
      .where('customer.userId = :userId', { userId })
      .andWhere('customer.deleteTime IS NULL');

    if (query.search) {
      qb.andWhere(
        '(customer.companyName LIKE :search OR customer.contactName LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.intentLevel) {
      qb.andWhere('customer.intentLevel = :intentLevel', {
        intentLevel: query.intentLevel,
      });
    }

    if (query.customerType) {
      qb.andWhere('customer.customerType = :customerType', {
        customerType: query.customerType,
      });
    }

    qb.orderBy('customer.createTime', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [list, total] = await qb.getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findOne(userId: number, id: number) {
    const customer = await this.customerRepo.findOne({
      where: { id, userId },
    });
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }
    return customer;
  }

  async update(userId: number, id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(userId, id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async remove(userId: number, id: number) {
    const customer = await this.findOne(userId, id);
    await this.customerRepo.softDelete(id);
    return customer;
  }
}
