import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../auth/entity/user.entity';
import { Otp } from '../auth/entity/otp.entity';
import { SeederOptions } from 'typeorm-extension';

config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Otp],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  seeds: ['src/database/seeds/**/*.ts'],
  factories: ['src/database/factories/**/*.ts'],
};

export default new DataSource(options);
