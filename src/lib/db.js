import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Full query text on every call was a lot of noise on the hot path —
    // only log in dev, or in production when a query is slow enough to be
    // worth knowing about.
    if (process.env.NODE_ENV !== 'production' || duration > 500) {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Real transactions: query() acquires and releases a pooled connection per
// call, so a bare query('BEGIN') / query('COMMIT') pair does NOT isolate a
// multi-statement write — with pool.max > 1, a concurrent request can run
// its own queries against the same "transaction" nobody else is holding.
// withTransaction checks out one dedicated client for the whole callback so
// BEGIN/COMMIT/ROLLBACK actually mean what they say. Pass `client` down to
// every query inside `fn` — reaching back into pool.query()/query() from
// inside a transaction defeats the isolation this function exists to give.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
