import 'dotenv/config';

const ambiente = process.env.NODE_ENV === 'test' ? 'test' : 'development';

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: ambiente === 'test' ? `${process.env.DB_NAME}_test` : process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialect: 'postgres',
  logging: false,
};

export default config;
