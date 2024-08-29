  import * as fs from 'fs';
  import * as path from 'path';
  import { TypeOrmModuleOptions } from '@nestjs/typeorm';
  import * as dotenv from 'dotenv';
  dotenv.config();
  // const isProduction = process.env.NODE_ENV === 'production';

  export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), //port default 3306 lihat xampp
    username: process.env.DB_USERNAME, // username default xampp root
    password: process.env.DB_PASSWORD, // password default xampp string kosong
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, './ca.pem')),
      rejectUnauthorized: false,
    }   
  }
  console.log('username:', process.env.DB_USERNAME);
  console.log('SSL CA Path:', path.join(__dirname, './ca.pem'));
  console.log('SSL CA Content:', fs.existsSync(path.join(__dirname, './ca.pem')) ? 'File exists' : 'File not found');


