import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { success } from '../../common/response.util';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateCustomerDto) {
    const customer = await this.customerService.create(req.user.id, dto);
    return success(customer, '创建成功');
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('intentLevel') intentLevel?: string,
    @Query('customerType') customerType?: string,
  ) {
    const result = await this.customerService.findAll(req.user.id, {
      page,
      pageSize,
      search,
      intentLevel,
      customerType,
    });
    return success(result);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const customer = await this.customerService.findOne(req.user.id, id);
    return success(customer);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    const customer = await this.customerService.update(req.user.id, id, dto);
    return success(customer, '更新成功');
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const customer = await this.customerService.remove(req.user.id, id);
    return success(customer, '删除成功');
  }
}
