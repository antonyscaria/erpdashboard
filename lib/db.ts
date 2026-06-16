import mysql from "mysql2/promise";

const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
      minVersion: "TLSv1.2",
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PORT =", process.env.DB_PORT);

if (!globalForDb.pool) {
  globalForDb.pool = pool;
}