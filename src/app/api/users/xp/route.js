import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { xp, streak, lastDailyDate } = await req.json();

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (xp != null) {
      updates.push(`xp = $${paramCount}`);
      params.push(xp);
      paramCount++;
    }

    if (lastDailyDate != null) {
      // Completing the daily challenge is the one place streak changes.
      // Compute it here, server-side, keyed off the PREVIOUS last_daily_date,
      // so re-sending the same date (e.g. a replayed "Try Again" run, or a
      // retried request) can never bump the streak twice in one day.
      updates.push(`last_daily_date = $${paramCount}`);
      params.push(lastDailyDate);
      paramCount++;
      updates.push(`streak = CASE
        WHEN last_daily_date = $${paramCount} THEN streak
        WHEN last_daily_date = ($${paramCount}::date - INTERVAL '1 day')::text THEN streak + 1
        ELSE 1
      END`);
      params.push(lastDailyDate);
      paramCount++;
    } else if (streak != null) {
      // Plain xp/streak sync (no daily-completion event) — trust the client
      // value as before.
      updates.push(`streak = $${paramCount}`);
      params.push(streak);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(decoded.userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      params
    );

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error updating XP:', err);
    return Response.json({ error: 'Failed to update XP' }, { status: 500 });
  }
}
