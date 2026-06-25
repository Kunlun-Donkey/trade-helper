import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(userId: number, dto: CreateProductDto) {
    const product = this.productRepo.create({
      ...dto,
      userId,
    });
    return this.productRepo.save(product);
  }

  async findAll(
    userId: number,
    page = 1,
    pageSize = 20,
    search?: string,
  ) {
    const qb = this.productRepo.createQueryBuilder('product');

    qb.where('product.userId = :userId', { userId });

    if (search) {
      qb.andWhere(
        '(product.name LIKE :search OR product.nameEn LIKE :search OR product.sku LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('product.createTime', 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { list, total, page, pageSize };
  }

  async findOne(userId: number, id: number) {
    const product = await this.productRepo.findOne({
      where: { id, userId },
    });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    return product;
  }

  async update(userId: number, id: number, dto: UpdateProductDto) {
    const product = await this.findOne(userId, id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(userId: number, id: number) {
    const product = await this.findOne(userId, id);
    await this.productRepo.softRemove(product);
    return null;
  }

  async uploadImage(file: Express.Multer.File) {
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return { url: `/uploads/${filename}` };
  }
}
