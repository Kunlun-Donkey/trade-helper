import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('order_pay')
export class OrderPay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'customer_id', type: 'bigint', nullable: true })
  customerId: number;

  @Column({ name: 'order_no', length: 50 })
  orderNo: string;

  @Column({ name: 'product_desc', length: 500, nullable: true })
  productDesc: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  deposit: number;

  @Column({
    name: 'deposit_status',
    type: 'simple-enum',
    enum: ['pending', 'received'],
    default: 'pending',
  })
  depositStatus: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: number;

  @Column({
    name: 'balance_status',
    type: 'simple-enum',
    enum: ['pending', 'received'],
    default: 'pending',
  })
  balanceStatus: string;

  @Column({ name: 'balance_due_date', type: 'date', nullable: true })
  balanceDueDate: string;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod: string;

  @Column({
    name: 'order_status',
    type: 'simple-enum',
    enum: ['quotation', 'sample', 'confirmed', 'shipped', 'completed'],
    default: 'quotation',
  })
  orderStatus: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @DeleteDateColumn({ name: 'delete_time' })
  deleteTime: Date;
}
