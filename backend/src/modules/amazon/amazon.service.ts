import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { AmazonData } from '../../entities/amazon-data.entity';

@Injectable()
export class AmazonService {
  constructor(
    @InjectRepository(AmazonData)
    private amazonRepo: Repository<AmazonData>,
  ) {}

  async upload(userId: number, file: Express.Multer.File, reportType: string) {
    // Parse the uploaded file using xlsx
    let parsedData: any[] = [];
    let status = 'done';

    try {
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    } catch (err) {
      status = 'failed';
      parsedData = [];
    }

    const report = this.amazonRepo.create({
      userId,
      reportType,
      fileName: file.originalname,
      filePath: file.path,
      parsedData: JSON.stringify(parsedData),
      status,
    });

    return this.amazonRepo.save(report);
  }

  async findAll(
    userId: number,
    page = 1,
    pageSize = 20,
    reportType?: string,
  ) {
    const where: any = { userId };

    if (reportType) {
      where.reportType = reportType;
    }

    const [items, total] = await this.amazonRepo.findAndCount({
      where,
      order: { createTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      // Exclude parsedData from list for performance
      select: {
        id: true,
        userId: true,
        reportType: true,
        fileName: true,
        filePath: true,
        reportDateStart: true,
        reportDateEnd: true,
        status: true,
        createTime: true,
        updateTime: true,
      },
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(userId: number, id: number) {
    const report = await this.amazonRepo.findOne({
      where: { id, userId },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async getParsedData(userId: number, id: number) {
    const report = await this.findOne(userId, id);

    let data: any[] = [];
    try {
      data = report.parsedData ? JSON.parse(report.parsedData) : [];
    } catch {
      data = [];
    }

    return {
      id: report.id,
      reportType: report.reportType,
      fileName: report.fileName,
      status: report.status,
      data,
      totalRows: data.length,
    };
  }

  async remove(userId: number, id: number) {
    const report = await this.findOne(userId, id);

    // Delete the physical file if it exists
    if (report.filePath && fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }

    await this.amazonRepo.softDelete(id);
    return { deleted: true };
  }
}
