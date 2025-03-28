import { config } from 'mssql';

// SQL Server configuration
export const sqlConfig: config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Required for local dev / self-signed certificates
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000
};
