import { Pool } from 'pg';

// Vercel Postgres sets POSTGRES_URL; custom databases use DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Serverless-friendly: keep connection count low and release idle connections quickly
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
