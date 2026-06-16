import mysql from "mysql2/promise";

const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL, // ❗ key change

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,

    ssl: {
      minVersion: "TLSv1.2",
    },
  });

if (!globalForDb.pool) {
  globalForDb.pool = pool;
}