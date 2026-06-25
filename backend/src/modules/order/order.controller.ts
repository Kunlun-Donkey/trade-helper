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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { success } from '../../common/response.util';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    const order = await this.orderService.create(req.user.id, dto);
    return success(order, 'Order created');
  }

  @Get('stats')
  async getStats(@Request() req) {
    const stats = await this.orderService.getStats(req.user.id);
    return success(stats);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('orderStatus') orderStatus?: string,
    @Query('orderNo') orderNo?: string,
  ) {
    const result = await this.orderService.findAll(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      orderStatus,
      orderNo,
    );
    return success(result);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const order = await this.orderService.findOne(req.user.id, id);
    return success(order);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateOrderDto>,
  ) {
    const order = await this.orderService.update(req.user.id, id, dto);
    return success(order, 'Order updated');
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.orderService.remove(req.user.id, id);
    return success(result, 'Order deleted');
  }
}
