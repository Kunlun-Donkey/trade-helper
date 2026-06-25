import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { OrderPay } from '../../entities/order-pay.entity';
import { Invoice } from '../../entities/invoice.entity';
import { FollowLog } from '../../entities/follow-log.entity';
import { AmazonData } from '../../entities/amazon-data.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(OrderPay)
    private orderRepo: Repository<OrderPay>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(FollowLog)
    private followLogRepo: Repository<FollowLog>,
    @InjectRepository(AmazonData)
    private amazonRepo: Repository<AmazonData>,
  ) {}

  async getB2BStats(userId: number) {
    // --- Customer stats by intentLevel ---
    const customers = await this.customerRepo.find({
      where: { userId },
      select: { id: true, intentLevel: true, createTime: true },
    });

    const intentLevelCounts = {
      high: 0,
      medium: 0,
      low: 0,
      sleep: 0,
    };
    customers.forEach((c) => {
      if (intentLevelCounts.hasOwnProperty(c.intentLevel)) {
        intentLevelCounts[c.intentLevel]++;
      }
    });

    // New customers this week and month
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const newCustomersThisWeek = customers.filter(
      (c) => new Date(c.createTime) >= weekAgo,
    ).length;

    const newCustomersThisMonth = customers.filter(
      (c) => new Date(c.createTime) >= monthAgo,
    ).length;

    // --- Order stats by status ---
    const orders = await this.orderRepo.find({
      where: { userId },
      select: { id: true, orderStatus: true, totalAmount: true, deposit: true, balance: true, depositStatus: true, balanceStatus: true },
    });

    const orderStatusCounts: Record<string, number> = {
      quotation: 0,
      sample: 0,
      confirmed: 0,
      shipped: 0,
      completed: 0,
    };
    let totalAmount = 0;
    let receivedAmount = 0;

    orders.forEach((o) => {
      if (orderStatusCounts.hasOwnProperty(o.orderStatus)) {
        orderStatusCounts[o.orderStatus]++;
      }
      totalAmount += Number(o.totalAmount);
      if (o.depositStatus === 'received') receivedAmount += Number(o.deposit);
      if (o.balanceStatus === 'received') receivedAmount += Number(o.balance);
    });

    return {
      customerCount: customers.length,
      intentLevelCounts,
      newCustomersThisWeek,
      newCustomersThisMonth,
      orderCount: orders.length,
      orderStatusCounts,
      totalAmount,
      receivedAmount,
      pendingAmount: totalAmount - receivedAmount,
    };
  }

  async getAmazonStats(userId: number) {
    const reports = await this.amazonRepo
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.delete_time IS NULL')
      .getMany();

    let totalRows = 0;
    let totalReports = reports.length;
    const byType: Record<string, { count: number; rows: number }> = {};

    reports.forEach((r: any) => {
      let rowCount = 0;
      try {
        const data = r.parsedData ? JSON.parse(r.parsedData) : [];
        rowCount = data.length;
      } catch {
        rowCount = 0;
      }
      totalRows += rowCount;

      if (!byType[r.reportType]) {
        byType[r.reportType] = { count: 0, rows: 0 };
      }
      byType[r.reportType].count++;
      byType[r.reportType].rows += rowCount;
    });

    return {
      totalReports,
      totalRows,
      byType,
    };
  }

  async getTodos(userId: number) {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const today = now.toISOString().split('T')[0];

    // 1. Customers needing follow-up: nextFollowTime < now + 3 days
    const needFollowUp = await this.customerRepo
      .createQueryBuilder('c')
      .where('c.user_id = :userId', { userId })
      .andWhere('c.delete_time IS NULL')
      .andWhere('c.next_follow_time IS NOT NULL')
      .andWhere('c.next_follow_time <= :threeDaysLater', {
        threeDaysLater: threeDaysLater.toISOString().slice(0, 19).replace('T', ' '),
      })
      .orderBy('c.next_follow_time', 'ASC')
      .getMany();

    // 2. Overdue payments: balanceDueDate < today and balanceStatus = 'pending'
    const overduePayments = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.delete_time IS NULL')
      .andWhere('o.balance_due_date IS NOT NULL')
      .andWhere('o.balance_due_date < :today', { today })
      .andWhere('o.balance_status = :status', { status: 'pending' })
      .orderBy('o.balance_due_date', 'ASC')
      .getMany();

    // 3. Unquoted high-intent customers (intentLevel = 'high' and no orders)
    const highIntentCustomers = await this.customerRepo
      .createQueryBuilder('c')
      .where('c.user_id = :userId', { userId })
      .andWhere('c.delete_time IS NULL')
      .andWhere('c.intent_level = :level', { level: 'high' })
      .getMany();

    const customerIds = highIntentCustomers.map((c) => c.id);

    let unquotedHighIntent: Customer[] = [];
    if (customerIds.length > 0) {
      // Find customers who have no orders
      const customersWithOrders = await this.orderRepo
        .createQueryBuilder('o')
        .select('DISTINCT o.customer_id', 'customerId')
        .where('o.user_id = :userId', { userId })
        .andWhere('o.customer_id IN (:...customerIds)', { customerIds })
        .andWhere('o.delete_time IS NULL')
        .getRawMany();

      const quotedCustomerIds = new Set(
        customersWithOrders.map((r) => Number(r.customerId)),
      );

      unquotedHighIntent = highIntentCustomers.filter(
        (c) => !quotedCustomerIds.has(c.id),
      );
    }

    return {
      needFollowUp,
      needFollowUpCount: needFollowUp.length,
      overduePayments,
      overduePaymentsCount: overduePayments.length,
      unquotedHighIntent,
      unquotedHighIntentCount: unquotedHighIntent.length,
    };
  }
}
