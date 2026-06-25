import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'name_en', length: 200, nullable: true })
  nameEn: string;

  @Column({ length: 100, nullable: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  spec: string;

  @Column({ name: 'purchase_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchaseCost: number;

  @Column({ name: 'tax_rebate_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRebateRate: number;

  @Column({ name: 'gross_weight', type: 'decimal', precision: 10, scale: 2, default: 0 })
  grossWeight: number;

  @Column({ name: 'net_weight', type: 'decimal', precision: 10, scale: 2, default: 0 })
  netWeight: number;

  @Column({ name: 'box_size', length: 50, nullable: true })
  boxSize: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @DeleteDateColumn({ name: 'delete_time' })
  deleteTime: Date;
}
