import { query, withTransaction } from './lib/db.js';
import { insertVariant, resolveContributorName } from './lib/variants.js';

// Types that now publish instantly on submit instead of sitting in the
// custodian queue — see api/contributions/route.js. Any row still
// 'pending' from before that change needs to be published and given its
// word_variants row so it isn't stranded mid-queue.
const INSTANT_PUBLISH_TYPES = ['correction', 'usage_example', 'pronunciation_audio', 'interpretation'];

// One-time backfill, safe to re-run: a contribution only shows up here
// while status = 'pending', so once it's published it's never selected
// again. word_variants.contribution_id is also UNIQUE, so even a
// concurrent/duplicate run can't double-publish the same contribution.
async function backfillInstantPublish() {
  const pending = await query(
    `SELECT id, user_id, type, word_id, dialect, payload FROM contributions WHERE status = 'pending' AND type = ANY($1)`,
    [INSTANT_PUBLISH_TYPES]
  );
  for (const contribution of pending.rows) {
    try {
      await withTransaction(async (client) => {
        const contributorName = await resolveContributorName(contribution.user_id, client);
        await insertVariant(contribution, contributorName, {}, client);
        await client.query(`UPDATE contributions SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [contribution.id]);
      });
    } catch (err) {
      console.error(`Backfill: could not publish contribution ${contribution.id}:`, err.message);
    }
  }
  if (pending.rows.length > 0) {
    console.log(`Backfill: published ${pending.rows.length} previously-pending contribution(s)`);
  }
}

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
    await query(`ALTER TABLE word_variants ADD COLUMN IF NOT EXISTS xp_awarded BOOLEAN DEFAULT false`);

    await query(`CREATE INDEX IF NOT EXISTS idx_word_comments_user_time ON word_comments(user_id, created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_contributions_time ON contributions(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_contributions_status_time ON contributions(status, created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_word_variants_time ON word_variants(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_time ON users(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_recording_votes_user ON recording_votes(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_updated ON connections(updated_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_custodian_applications_status ON custodian_applications(status)`);

    console.log('Database migrations completed successfully');

    await backfillInstantPublish();
  } catch (error) {
    console.error('Failed to run database migrations:', error);
    // Log error but don't block startup to avoid cascading failures
  }
}
