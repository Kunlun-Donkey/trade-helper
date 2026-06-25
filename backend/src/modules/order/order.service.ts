import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Like } from 'typeorm';
import { OrderPay } from '../../entities/order-pay.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderPay)
    private orderRepo: Repository<OrderPay>,
  ) {}

  async create(userId: number, dto: CreateOrderDto) {
    const balance = (dto.totalAmount || 0) - (dto.deposit || 0);

    const order = this.orderRepo.create({
      userId,
      customerId: dto.customerId,
      orderNo: dto.orderNo,
      productDesc: dto.productDesc,
      totalAmount: dto.totalAmount,
      currency: dto.currency || 'USD',
      deposit: dto.deposit || 0,
      depositStatus: dto.depositStatus || 'pending',
      balance,
      balanceStatus: dto.balanceStatus || 'pending',
      balanceDueDate: dto.balanceDueDate,
      paymentMethod: dto.paymentMethod,
      orderStatus: dto.orderStatus || 'quotation',
      remark: dto.remark,
    });

    return this.orderRepo.save(order);
  }

  async findAll(
    userId: number,
    page = 1,
    pageSize = 20,
    orderStatus?: string,
    orderNo?: string,
  ) {
    const where: any = { userId };

    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    if (orderNo) {
      where.orderNo = Like(`%${orderNo}%`);
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order: { createTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(userId: number, id: number) {
    const order = await this.orderRepo.findOne({
      where: { id, userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(userId: number, id: number, dto: Partial<CreateOrderDto>) {
    const order = await this.findOne(userId, id);

    // Recalculate balance if totalAmount or deposit changed
    const totalAmount =
      dto.totalAmount !== undefined ? dto.totalAmount : Number(order.totalAmount);
    const deposit =
      dto.deposit !== undefined ? dto.deposit : Number(order.deposit);
    const balance = totalAmount - deposit;

    Object.assign(order, {
      ...dto,
      balance,
    });

    return this.orderRepo.save(order);
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    await this.orderRepo.softDelete(id);
    return { deleted: true };
  }

  async getStats(userId: number) {
    // Get all non-deleted orders for this user
    const orders = await this.orderRepo.find({
      where: { userId },
    });

    const totalAmount = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    const receivedAmount = orders.reduce((sum, o) => {
      let received = 0;
      if (o.depositStatus === 'received') received += Number(o.deposit);
      if (o.balanceStatus === 'received') received += Number(o.balance);
      return sum + received;
    }, 0);

    const pendingAmount = totalAmount - receivedAmount;

    // Overdue: balanceDueDate < today and balanceStatus = 'pending'
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = orders.filter(
      (o) =>
        o.balanceDueDate &&
        o.balanceDueDate < today &&
        o.balanceStatus === 'pending',
    ).length;

    return {
      totalAmount,
      receivedAmount,
      pendingAmount,
      overdueCount,
    };
  }
}
