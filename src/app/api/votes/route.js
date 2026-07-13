import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { XP_REWARDS } from '@/data/xpSystem';

const TARGET_TYPES = ['comment', 'variant'];
const XP_CAP_VOTES = 10; // 10 votes * commentUpvoted(2) = 20 XP cap per comment

// GET ?mine=1 — the caller's own active votes, as [{targetType, targetId}].
// One bootstrap fetch powers "did I vote this" across the whole app without
// re-fetching per component.
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT target_type, target_id FROM votes WHERE user_id = $1 AND active`,
      [decoded.userId]
    );
    return Response.json(
      result.rows.map(r => ({ targetType: r.target_type, targetId: r.target_id })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching votes:', error);
    return Response.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST {targetType: 'comment'|'variant', targetId} — toggles the caller's
// upvote on a comment or an accepted word variant (recordings included,
// since they're variant_type='pronunciation' rows). `active` is a soft
// toggle, not row deletion, so XP is only ever granted on the very first
// INSERT for a given (user, target) pair — an un-vote/re-vote loop can't
// re-earn it. Comment authors earn a small capped XP reward per unique
// upvote; variant "attestation" votes are archive signal only, no XP.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { targetType, targetId } = await req.json();
    const id = Number(targetId);
    if (!TARGET_TYPES.includes(targetType) || !Number.isInteger(id)) {
      return Response.json({ error: 'Invalid vote target' }, { status: 400 });
    }

    if (targetType === 'comment') {
      const exists = await query(`SELECT id FROM word_comments WHERE id = $1 AND NOT deleted`, [id]);
      if (exists.rows.length === 0) return Response.json({ error: 'Comment not found' }, { status: 404 });
    } else {
      const exists = await query(`SELECT id FROM word_variants WHERE id = $1`, [id]);
      if (exists.rows.length === 0) return Response.json({ error: 'Variant not found' }, { status: 404 });
    }

    const toggled = await query(
      `WITH ins AS (
         INSERT INTO votes (user_id, target_type, target_id, active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (user_id, target_type, target_id)
         DO UPDATE SET active = NOT votes.active
         RETURNING active, (xmax = 0) AS inserted
       )
       SELECT active, inserted FROM ins`,
      [decoded.userId, targetType, id]
    );
    const { active, inserted } = toggled.rows[0];

    const countResult = await query(
      `SELECT COUNT(*) AS n FROM votes WHERE target_type = $1 AND target_id = $2 AND active`,
      [targetType, id]
    );
    const count = Number(countResult.rows[0].n);

    // First-ever upvote on this comment from this user, still under the cap
    // — award the author (never the voter themselves).
    if (inserted && active && targetType === 'comment' && count <= XP_CAP_VOTES) {
      const authorResult = await query(`SELECT user_id FROM word_comments WHERE id = $1`, [id]);
      const authorId = authorResult.rows[0]?.user_id;
      if (authorId && authorId !== decoded.userId) {
        await query(`UPDATE users SET xp = xp + $1 WHERE id = $2`, [XP_REWARDS.commentUpvoted, authorId]);
        await query(`INSERT INTO xp_events (user_id, amount, source) VALUES ($1, $2, 'comment_upvoted')`, [authorId, XP_REWARDS.commentUpvoted]);
      }
    }

    return Response.json({ voted: active, count }, { status: 200 });
  } catch (error) {
    console.error('Error toggling vote:', error);
    return Response.json({ error: 'Failed to toggle vote' }, { status: 500 });
  }
}
