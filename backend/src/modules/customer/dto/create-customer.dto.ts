import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(200)
  companyName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;

  @IsOptional()
  @IsEnum(['high', 'medium', 'low', 'sleep'])
  intentLevel?: string;

  @IsOptional()
  @IsEnum(['buyer', 'wholesaler', 'trader', 'retail'])
  customerType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  mainProduct?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  nextFollowTime?: Date;
}
