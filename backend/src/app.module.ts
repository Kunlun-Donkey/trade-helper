import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ProductModule } from './modules/product/product.module';
import { DocumentModule } from './modules/document/document.module';
import { OrderModule } from './modules/order/order.module';
import { AmazonModule } from './modules/amazon/amazon.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get('DATABASE_URL');
        if (databaseUrl) {
          // PostgreSQL for production (Railway)
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/entities/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
            ssl: { rejectUnauthorized: false },
          };
        }
        // SQLite for local development
        return {
          type: 'better-sqlite3',
          database: config.get('DB_DATABASE', 'data/trade_helper.db'),
          entities: [__dirname + '/entities/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
        };
      },
    }),
    AuthModule,
    CustomerModule,
    ProductModule,
    DocumentModule,
    OrderModule,
    AmazonModule,
    DashboardModule,
  ],
})
export class AppModule {}
