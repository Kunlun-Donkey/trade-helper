import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  UploadedFile,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { AmazonService } from './amazon.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { success } from '../../common/response.util';

const storage = diskStorage({
  destination: './uploads/amazon',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `amazon-${uniqueSuffix}${ext}`);
  },
});

@Controller('amazon')
@UseGuards(JwtAuthGuard)
export class AmazonController {
  constructor(private amazonService: AmazonService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (_req, file, cb) => {
        const allowedMimes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.oasis.opendocument.spreadsheet',
        ];
        const allowedExts = ['.csv', '.xls', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV and Excel files are allowed'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('reportType') reportType: string,
  ) {
    if (!file) {
      return success(null, 'No file uploaded');
    }
    const report = await this.amazonService.upload(
      req.user.id,
      file,
      reportType,
    );
    return success(report, 'File uploaded and parsed');
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('reportType') reportType?: string,
  ) {
    const result = await this.amazonService.findAll(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      reportType,
    );
    return success(result);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const report = await this.amazonService.findOne(req.user.id, id);
    return success(report);
  }

  @Get(':id/data')
  async getParsedData(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.amazonService.getParsedData(req.user.id, id);
    return success(result);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.amazonService.remove(req.user.id, id);
    return success(result, 'Report deleted');
  }
}
