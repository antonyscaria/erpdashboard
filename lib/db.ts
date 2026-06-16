import mysql from "mysql2/promise";

// Global cache (prevents multiple connections in dev + serverless)
const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

// Save to global (important for Vercel serverless)
if (!globalForDb.pool) {
  globalForDb.pool = pool;
}