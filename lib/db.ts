import mysql from 'mysql2/promise';

// Define a type for the global object to hold the pool instance
const globalForDb = global as unknown as { pool: mysql.Pool };

export const pool =
  globalForDb.pool ||
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

// In development, store the pool on the global object so it survives HMR
if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}