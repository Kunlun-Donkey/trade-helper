import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsString()
  @MaxLength(50)
  orderNo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  productDesc?: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsEnum(['pending', 'received'])
  depositStatus?: string;

  @IsOptional()
  @IsEnum(['pending', 'received'])
  balanceStatus?: string;

  @IsOptional()
  @IsString()
  balanceDueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @IsOptional()
  @IsEnum(['quotation', 'sample', 'confirmed', 'shipped', 'completed'])
  orderStatus?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
