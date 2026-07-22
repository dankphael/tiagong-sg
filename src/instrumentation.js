import { query } from './lib/db.js';

export async function register() {
  try {
    console.log('Running database migrations...');

    // Add missing columns if they don't exist
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dialects_known JSONB DEFAULT '[]'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{}'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_date DATE`);
    await query(`ALTER TABLE connections ADD COLUMN IF NOT EXISTS message TEXT`);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Failed to run database migrations:', error);
    // Log error but don't block startup to avoid cascading failures
  }
}
