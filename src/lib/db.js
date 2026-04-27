import { db } from '@vercel/postgres';

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await db.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default db;
