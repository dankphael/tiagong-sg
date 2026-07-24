import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET ?variantIds=1,2,3 — the caller's own votes on a set of pronunciation
// recordings, so the client can highlight which recordings this user has
// already voted on. Kept separate from the public (cached) overlay endpoint
// since this is per-user and must never be cached.
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const ids = (searchParams.get('variantIds') || '')
      .split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n > 0).slice(0, 100);
    if (ids.length === 0) return Response.json({}, { status: 200 });

    const result = await query(
      `SELECT variant_id, value FROM recording_votes WHERE user_id = $1 AND variant_id = ANY($2)`,
      [decoded.userId, ids]
    );
    const map = {};
    for (const row of result.rows) map[row.variant_id] = row.value;
    return Response.json(map, { status: 200 });
  } catch (err) {
    console.error('Error fetching recording votes:', err);
    return Response.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST {variantId, value: 1|-1} — cast (or toggle off) a vote on a
// pronunciation recording (a word_variants row of variant_type =
// 'pronunciation'). Casting the same value again removes the vote;
// casting the opposite value flips it. Returns the recording's fresh tally
// so the client can update without a full overlay refetch.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { variantId, value } = await req.json();
    const id = Number(variantId);
    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'variantId is required' }, { status: 400 });
    }
    if (value !== 1 && value !== -1) {
      return Response.json({ error: 'value must be 1 or -1' }, { status: 400 });
    }

    const variantResult = await query(
      `SELECT id FROM word_variants WHERE id = $1 AND variant_type = 'pronunciation'`,
      [id]
    );
    if (variantResult.rows.length === 0) {
      return Response.json({ error: 'Recording not found' }, { status: 404 });
    }

    const existing = await query(
      `SELECT value FROM recording_votes WHERE variant_id = $1 AND user_id = $2`,
      [id, decoded.userId]
    );

    let myVote = value;
    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO recording_votes (variant_id, user_id, value) VALUES ($1, $2, $3)`,
        [id, decoded.userId, value]
      );
    } else if (existing.rows[0].value === value) {
      await query(`DELETE FROM recording_votes WHERE variant_id = $1 AND user_id = $2`, [id, decoded.userId]);
      myVote = 0;
    } else {
      await query(
        `UPDATE recording_votes SET value = $1, created_at = CURRENT_TIMESTAMP WHERE variant_id = $2 AND user_id = $3`,
        [value, id, decoded.userId]
      );
    }

    const tally = await query(
      `SELECT
         COUNT(*) FILTER (WHERE value = 1) AS up,
         COUNT(*) FILTER (WHERE value = -1) AS down
       FROM recording_votes WHERE variant_id = $1`,
      [id]
    );
    const up = Number(tally.rows[0].up);
    const down = Number(tally.rows[0].down);

    return Response.json({ variantId: id, up, down, score: up - down, myVote }, { status: 200 });
  } catch (err) {
    console.error('Error voting on recording:', err);
    return Response.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
