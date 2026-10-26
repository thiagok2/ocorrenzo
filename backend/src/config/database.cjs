require('dotenv').config();

const base = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialect: 'postgres',
};

module.exports = {
  development: { ...base, database: process.env.DB_NAME },
  test: { ...base, database: `${process.env.DB_NAME}_test` },
  production: { ...base, database: process.env.DB_NAME },
};
