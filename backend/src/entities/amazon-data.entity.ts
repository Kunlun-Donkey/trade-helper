import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('amazon_data')
export class AmazonData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({
    name: 'report_type',
    type: 'simple-enum',
    enum: ['order', 'business', 'inventory', 'finance'],
  })
  reportType: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'parsed_data', type: 'text', nullable: true })
  parsedData: string;

  @Column({ name: 'report_date_start', type: 'date', nullable: true })
  reportDateStart: string;

  @Column({ name: 'report_date_end', type: 'date', nullable: true })
  reportDateEnd: string;

  @Column({
    type: 'simple-enum',
    enum: ['uploading', 'parsing', 'done', 'failed'],
    default: 'uploading',
  })
  status: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @DeleteDateColumn({ name: 'delete_time' })
  deleteTime: Date;
}
