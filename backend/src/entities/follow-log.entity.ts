import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('follow_log')
export class FollowLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'customer_id', type: 'bigint' })
  customerId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'follow_type', length: 50, nullable: true })
  followType: string;

  @Column({ name: 'next_follow_days', type: 'int', nullable: true })
  nextFollowDays: number;

  @Column({ name: 'next_follow_time', type: 'datetime', nullable: true })
  nextFollowTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @DeleteDateColumn({ name: 'delete_time' })
  deleteTime: Date;

  @ManyToOne(() => Customer, (customer) => customer.followLogs)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
