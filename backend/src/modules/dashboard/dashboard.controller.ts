import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { success } from '../../common/response.util';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('b2b-stats')
  async getB2BStats(@Request() req) {
    const stats = await this.dashboardService.getB2BStats(req.user.id);
    return success(stats);
  }

  @Get('amazon-stats')
  async getAmazonStats(@Request() req) {
    const stats = await this.dashboardService.getAmazonStats(req.user.id);
    return success(stats);
  }

  @Get('todos')
  async getTodos(@Request() req) {
    const todos = await this.dashboardService.getTodos(req.user.id);
    return success(todos);
  }
}
