import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
  ) {}

  /**
   * Auto-generate invoice number: type prefix + date + sequence
   * e.g., "PI20240101001"
   */
  private async generateInvoiceNo(type: string): Promise<string> {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    const prefix = `${type}${dateStr}`;

    // Find the latest invoice with this prefix today
    const latest = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .where('invoice.invoice_no LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('invoice.invoice_no', 'DESC')
      .getOne();

    let seq = 1;
    if (latest) {
      const lastSeq = parseInt(latest.invoiceNo.slice(prefix.length), 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(3, '0')}`;
  }

  async create(userId: number, dto: CreateInvoiceDto) {
    const invoiceNo = await this.generateInvoiceNo(dto.type);

    // Auto-calculate totalAmount from items if not provided
    let totalAmount = dto.totalAmount || 0;
    if (dto.items && dto.items.length > 0 && !dto.totalAmount) {
      totalAmount = dto.items.reduce((sum, item) => {
        const amount = item.amount || item.quantity * item.unitPrice;
        return sum + amount;
      }, 0);
    }

    const invoice = this.invoiceRepo.create({
      userId,
      type: dto.type,
      invoiceNo,
      customerId: dto.customerId,
      items: dto.items,
      tradeTerms: dto.tradeTerms,
      paymentTerms: dto.paymentTerms,
      deliveryDate: dto.deliveryDate,
      totalAmount,
      currency: dto.currency || 'USD',
      notes: dto.notes,
    });

    return this.invoiceRepo.save(invoice);
  }

  async findAll(
    userId: number,
    page = 1,
    pageSize = 20,
    type?: string,
    invoiceNo?: string,
  ) {
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (invoiceNo) {
      where.invoiceNo = Like(`%${invoiceNo}%`);
    }

    const [items, total] = await this.invoiceRepo.findAndCount({
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
    const invoice = await this.invoiceRepo.findOne({
      where: { id, userId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async update(userId: number, id: number, dto: Partial<CreateInvoiceDto>) {
    const invoice = await this.findOne(userId, id);

    // Recalculate totalAmount if items changed and totalAmount not explicitly provided
    let totalAmount = dto.totalAmount;
    if (dto.items && dto.items.length > 0 && totalAmount === undefined) {
      totalAmount = dto.items.reduce((sum, item) => {
        const amount = item.amount || item.quantity * item.unitPrice;
        return sum + amount;
      }, 0);
    }

    Object.assign(invoice, {
      ...dto,
      ...(totalAmount !== undefined ? { totalAmount } : {}),
    });

    return this.invoiceRepo.save(invoice);
  }

  async remove(userId: number, id: number) {
    const invoice = await this.findOne(userId, id);
    await this.invoiceRepo.softDelete(id);
    return { deleted: true };
  }

  async generatePdf(userId: number, id: number) {
    const invoice = await this.findOne(userId, id);

    // TODO: Implement actual PDF generation with pdfmake
    // const PdfPrinter = require('pdfmake');
    // ...
    // Save to uploads/ directory
    // Update invoice.pdfUrl

    return {
      message: 'PDF generation will be implemented',
      invoiceNo: invoice.invoiceNo,
    };
  }
}
