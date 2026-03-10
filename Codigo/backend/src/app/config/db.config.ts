/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export async function getDatabaseConfig(): Promise<TypeOrmModuleOptions> {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'fabianamoveis',
    entities: [path.join(__dirname, '../..') + '/domains/**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: true,
    ssl: process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
    logging: false,
    extra: {
      timezone: '-03:00'
    }
  };
}