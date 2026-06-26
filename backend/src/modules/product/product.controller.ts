import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { success } from '../../common/response.util';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateProductDto) {
    const product = await this.productService.create(req.user.id, dto);
    return success(product, '创建成功');
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const size = pageSize ? parseInt(pageSize, 10) : 20;
    const result = await this.productService.findAll(
      req.user.id,
      pageNum,
      size,
      search,
    );
    return success(result);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.findOne(req.user.id, id);
    return success(product);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.productService.update(req.user.id, id, dto);
    return success(product, '更新成功');
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(req.user.id, id);
    return success(null, '删除成功');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG/PNG/GIF/WEBP 格式图片');
    }
    const result = await this.productService.uploadImage(file);
    return success(result, '上传成功');
  }
}
