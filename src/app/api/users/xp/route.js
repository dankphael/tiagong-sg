import { query } from '@/lib/db';
import { requireActiveAuth } from '@/lib/auth';
import { XP_REWARDS } from '@/data/xpSystem';

// Sources a client is allowed to claim XP for directly — exactly the
// gameplay events wired to awardXp() in src/components/AppProvider.js.
// 'contributionAccepted' is deliberately excluded: that's granted
// server-side only, by api/contributions/[id]/review and
// api/recordings/vote, never by client request.
const CLIENT_XP_SOURCES = ['correctAnswer', 'dailyComplete', 'speedRoundCorrect', 'greetingLearned'];
// Soft anti-grind ceiling — not real anti-cheat (that needs server-side game
// state), just enough to turn "any number, instantly" into "rate-limited".
const MAX_XP_PER_24H = 2000;

// POST { source } — award XP for a single gameplay event. The server looks
// up the amount from XP_REWARDS; the client never names a number. Replaces
// the old contract where the client PATCHed its current absolute xp total,
// which had no validation at all and let any signed-in user set their own
// XP to anything.
export async function POST(req) {
  const { error, status, decoded } = await requireActiveAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { source } = await req.json();
    if (!CLIENT_XP_SOURCES.includes(source)) {
      return Response.json({ error: 'Invalid XP source' }, { status: 400 });
    }
    const amount = XP_REWARDS[source];

    const recent = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM xp_events WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
      [decoded.userId]
    );
    if (Number(recent.rows[0].total) + amount > MAX_XP_PER_24H) {
      return Response.json({ error: 'Daily XP limit reached' }, { status: 429 });
    }

    await query(`UPDATE users SET xp = xp + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [amount, decoded.userId]);
    await query(`INSERT INTO xp_events (user_id, amount, source) VALUES ($1, $2, $3)`, [decoded.userId, amount, source]);

    return Response.json({ amount }, { status: 200 });
  } catch (err) {
    console.error('Error awarding XP:', err);
    return Response.json({ error: 'Failed to award XP' }, { status: 500 });
  }
}

// PATCH { lastDailyDate } — the one place streak changes: completing the
// daily challenge. Streak is computed here, server-side, keyed off the
// PREVIOUS last_daily_date, so replaying the same date can never bump the
// streak twice in one day. This route no longer accepts a client-supplied
// xp or streak value.
export async function PATCH(req) {
  const { error, status, decoded } = await requireActiveAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { lastDailyDate } = await req.json();
    if (lastDailyDate == null) {
      return Response.json({ error: 'lastDailyDate is required' }, { status: 400 });
    }

    await query(
      `UPDATE users SET
         streak = CASE
           WHEN last_daily_date = $1 THEN streak
           WHEN last_daily_date = ($1::date - INTERVAL '1 day')::text THEN streak + 1
           ELSE 1
         END,
         last_daily_date = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [lastDailyDate, decoded.userId]
    );

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error updating streak:', err);
    return Response.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}
