import { query } from '@/lib/db';

// Lightweight per-user rate limit: counts a user's rows in `table` within
// the last `windowMs`, using that table's own created_at column. No Redis —
// this is a backstop against grinding/abuse, not a general-purpose limiter,
// so a plain COUNT(*) per call is fine at this scale.
//
// userColumn lets callers point at whichever column identifies the actor
// (e.g. messages.sender_id instead of the usual user_id). extraWhere/
// extraParams let callers narrow the count further (e.g. only
// pronunciation_audio contributions), referencing extra params starting
// at $3.
//
// Returns null when the caller is under the limit, or { error, status }
// (matching the requireAuth/requireActiveAuth shape) when they've hit it.
export async function assertUnderLimit({ userId, table, windowMs, max, userColumn = 'user_id', extraWhere = '', extraParams = [] }) {
  const result = await query(
    `SELECT COUNT(*) AS n FROM ${table}
     WHERE ${userColumn} = $1 AND created_at >= NOW() - $2::interval ${extraWhere}`,
    [userId, `${windowMs} milliseconds`, ...extraParams]
  );
  if (Number(result.rows[0].n) >= max) {
    return { error: 'Rate limit exceeded — please slow down and try again shortly', status: 429 };
  }
  return null;
}
