import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
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

  async bulkImport(userId: number, file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    // Column header mapping (Chinese → English)
    const headerMap: Record<string, string> = {
      '公司名': 'companyName', '公司名称': 'companyName', 'companyName': 'companyName',
      '国家': 'country', 'country': 'country',
      '联系人': 'contactName', '联系人姓名': 'contactName', 'contactName': 'contactName',
      '职位': 'position', 'position': 'position',
      '邮箱': 'email', 'email': 'email',
      'WhatsApp': 'whatsapp', 'whatsapp': 'whatsapp', 'Whatsapp': 'whatsapp',
      '来源': 'source', 'source': 'source',
      '意向等级': 'intentLevel', 'intentLevel': 'intentLevel',
      '客户类型': 'customerType', 'customerType': 'customerType',
      '主营产品': 'mainProduct', 'mainProduct': 'mainProduct',
      '备注': 'remark', 'remark': 'remark',
    };

    const validIntentLevels = ['高', '中', '低', '沉睡', 'high', 'medium', 'low', 'sleep'];
    const validCustomerTypes = ['采购商', '批发商', '贸易商', '散户', 'buyer', 'wholesaler', 'trader', 'retail'];

    const errors: { row: number; message: string }[] = [];
    const validCustomers: Partial<Customer>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed header + data)
      const mapped: Record<string, string> = {};

      // Map headers
      for (const [key, value] of Object.entries(row)) {
        const field = headerMap[key.trim()];
        if (field) {
          mapped[field] = String(value).trim();
        }
      }

      // Validate required field
      if (!mapped.companyName) {
        errors.push({ row: rowNum, message: '公司名不能为空' });
        continue;
      }

      // Validate enums if provided
      if (mapped.intentLevel && !validIntentLevels.includes(mapped.intentLevel)) {
        errors.push({ row: rowNum, message: `意向等级"${mapped.intentLevel}"无效，可选：高/中/低/沉睡` });
        continue;
      }
      if (mapped.customerType && !validCustomerTypes.includes(mapped.customerType)) {
        errors.push({ row: rowNum, message: `客户类型"${mapped.customerType}"无效，可选：采购商/批发商/贸易商/散户` });
        continue;
      }

      validCustomers.push({
        userId,
        companyName: mapped.companyName,
        country: mapped.country || '',
        contactName: mapped.contactName || '',
        email: mapped.email || '',
        whatsapp: mapped.whatsapp || '',
        source: mapped.source || '',
        intentLevel: (mapped.intentLevel as Customer['intentLevel']) || undefined,
        customerType: (mapped.customerType as Customer['customerType']) || undefined,
        mainProduct: mapped.mainProduct || '',
        remark: mapped.remark || '',
      } as Partial<Customer>);
    }

    // Bulk insert valid customers
    let successCount = 0;
    if (validCustomers.length > 0) {
      const entities = this.customerRepo.create(validCustomers);
      await this.customerRepo.save(entities);
      successCount = validCustomers.length;
    }

    return {
      total: rows.length,
      success: successCount,
      failed: errors.length,
      errors: errors.slice(0, 50), // Limit error details to 50
    };
  }
}
