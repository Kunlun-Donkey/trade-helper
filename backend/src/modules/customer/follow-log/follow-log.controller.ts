import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowLogService } from './follow-log.service';
import { CreateFollowLogDto } from './dto/create-follow-log.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { success } from '../../../common/response.util';

@Controller('customer/:customerId/follow-log')
@UseGuards(JwtAuthGuard)
export class FollowLogController {
  constructor(private followLogService: FollowLogService) {}

  @Post()
  async create(
    @Request() req,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() dto: CreateFollowLogDto,
  ) {
    const log = await this.followLogService.create(req.user.id, customerId, dto);
    return success(log, '创建成功');
  }

  @Get()
  async findAll(
    @Request() req,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    const list = await this.followLogService.findAll(req.user.id, customerId);
    return success(list);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const log = await this.followLogService.findOne(req.user.id, id);
    return success(log);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const log = await this.followLogService.remove(req.user.id, id);
    return success(log, '删除成功');
  }
}
