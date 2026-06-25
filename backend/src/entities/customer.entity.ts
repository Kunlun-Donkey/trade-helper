import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { FollowLog } from './follow-log.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'company_name', length: 200 })
  companyName: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ name: 'contact_name', length: 100, nullable: true })
  contactName: string;

  @Column({ length: 50, nullable: true })
  position: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 30, nullable: true })
  whatsapp: string;

  @Column({ length: 50, nullable: true })
  source: string;

  @Column({
    name: 'intent_level',
    type: 'simple-enum',
    enum: ['high', 'medium', 'low', 'sleep'],
    default: 'medium',
  })
  intentLevel: string;

  @Column({
    name: 'customer_type',
    type: 'simple-enum',
    enum: ['buyer', 'wholesaler', 'trader', 'retail'],
    default: 'buyer',
  })
  customerType: string;

  @Column({ name: 'main_product', length: 200, nullable: true })
  mainProduct: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'next_follow_time', type: 'datetime', nullable: true })
  nextFollowTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @DeleteDateColumn({ name: 'delete_time' })
  deleteTime: Date;

  @OneToMany(() => FollowLog, (log) => log.customer)
  followLogs: FollowLog[];
}
