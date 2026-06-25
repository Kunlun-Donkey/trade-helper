import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ type: 'simple-enum', enum: ['PI', 'CI', 'PL', 'contract'] })
  type: string;

  @Column({ name: 'invoice_no', length: 50 })
  invoiceNo: string;

  @Column({ name: 'customer_id', type: 'bigint', nullable: true })
  customerId: number;

  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: any[]) => JSON.stringify(value || []),
      from: (value: string) => {
        try { return JSON.parse(value || '[]'); } catch { return []; }
      },
    },
  })
  items: any[];

  @Column({ name: 'trade_terms', length: 20, nullable: true })
  tradeTerms: string;

  @Column({ name: 'payment_terms', length: 100, nullable: true })
  paymentTerms: string;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'pdf_url', length: 500, nullable: true })
  pdfUrl: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @DeleteDateColumn({ name: 'delete_time' })
  deleteTime: Date;
}
