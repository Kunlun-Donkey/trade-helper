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
import { DocumentService } from './document.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { success } from '../../common/response.util';

@Controller('document')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateInvoiceDto) {
    const invoice = await this.documentService.create(req.user.id, dto);
    return success(invoice, 'Invoice created');
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: string,
    @Query('invoiceNo') invoiceNo?: string,
  ) {
    const result = await this.documentService.findAll(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      type,
      invoiceNo,
    );
    return success(result);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const invoice = await this.documentService.findOne(req.user.id, id);
    return success(invoice);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateInvoiceDto>,
  ) {
    const invoice = await this.documentService.update(req.user.id, id, dto);
    return success(invoice, 'Invoice updated');
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.documentService.remove(req.user.id, id);
    return success(result, 'Invoice deleted');
  }

  @Post(':id/pdf')
  async generatePdf(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.documentService.generatePdf(req.user.id, id);
    return success(result);
  }
}
