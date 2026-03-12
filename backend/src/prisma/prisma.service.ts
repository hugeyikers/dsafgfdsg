// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    console.log('--- Inicjalizacja PrismaAdapter ---');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`DB: ${process.env.DB_NAME}`);

    // Adapter MariaDB obsługuje zarówno MariaDB, jak i standardowy MySQL
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'szap',
      connectionLimit: 10
    });
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}