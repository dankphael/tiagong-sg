import { query, withTransaction } from '@/lib/db';
import { requireAuth, requireActiveAuth } from '@/lib/auth';
import { assertUnderLimit } from '@/lib/rateLimit';
import { XP_REWARDS } from '@/data/xpSystem';

// Net score at which a variant's submitter earns XP for it — the community
// upvoting something to a net positive is what "acceptance" means now for
// every instant-publish type (see api/contributions/route.js).
const XP_VOTE_THRESHOLD = 1;

// GET ?variantIds=1,2,3 — the caller's own votes on a set of variants, so
// the client can highlight which ones this user has already voted on. Kept
// separate from the public (cached) overlay endpoint since this is
// per-user and must never be cached.
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

// POST {variantId, value: 1|-1} — cast (or toggle off) a vote on any
// word_variants row (recordings, interpretations, examples, corrections,
// new words). Casting the same value again removes the vote; casting the
// opposite value flips it. Once a variant's net score first reaches
// XP_VOTE_THRESHOLD, its submitter is credited XP — a one-time award
// guarded by word_variants.xp_awarded, so later downvotes never claw it
// back and re-crossing the threshold never pays twice. Returns the
// variant's fresh tally so the client can update without a full overlay
// refetch. Wrapped in withTransaction: this route does a read-then-write
// (existing vote → insert/update/delete → tally → XP claim) that needs to
// run on one connection, isolated from concurrent votes on the same variant.
export async function POST(req) {
  const { error, status, decoded } = await requireActiveAuth(req);
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

    const rateLimited = await assertUnderLimit({
      userId: decoded.userId, table: 'recording_votes', windowMs: 60 * 60 * 1000, max: 100,
    });
    if (rateLimited) return Response.json({ error: rateLimited.error }, { status: rateLimited.status });

    const result = await withTransaction(async (client) => {
      const variantResult = await client.query(`SELECT id FROM word_variants WHERE id = $1`, [id]);
      if (variantResult.rows.length === 0) {
        return { notFound: true };
      }

      const existing = await client.query(
        `SELECT value FROM recording_votes WHERE variant_id = $1 AND user_id = $2`,
        [id, decoded.userId]
      );

      let myVote = value;
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO recording_votes (variant_id, user_id, value) VALUES ($1, $2, $3)`,
          [id, decoded.userId, value]
        );
      } else if (existing.rows[0].value === value) {
        await client.query(`DELETE FROM recording_votes WHERE variant_id = $1 AND user_id = $2`, [id, decoded.userId]);
        myVote = 0;
      } else {
        await client.query(
          `UPDATE recording_votes SET value = $1, created_at = CURRENT_TIMESTAMP WHERE variant_id = $2 AND user_id = $3`,
          [value, id, decoded.userId]
        );
      }

      const tally = await client.query(
        `SELECT
           COUNT(*) FILTER (WHERE value = 1) AS up,
           COUNT(*) FILTER (WHERE value = -1) AS down
         FROM recording_votes WHERE variant_id = $1`,
        [id]
      );
      const up = Number(tally.rows[0].up);
      const down = Number(tally.rows[0].down);
      const score = up - down;

      if (score >= XP_VOTE_THRESHOLD) {
        // Atomic claim: only the request that flips xp_awarded false→true
        // gets a row back, so concurrent votes can't double-pay.
        const claim = await client.query(
          `UPDATE word_variants SET xp_awarded = true WHERE id = $1 AND NOT xp_awarded RETURNING contribution_id`,
          [id]
        );
        if (claim.rows.length > 0 && claim.rows[0].contribution_id != null) {
          const contributionResult = await client.query(`SELECT user_id FROM contributions WHERE id = $1`, [claim.rows[0].contribution_id]);
          const submitterId = contributionResult.rows[0]?.user_id;
          // The flag is claimed above regardless — only the award itself is
          // skipped for a self-vote, so a submitter can't upvote their own
          // work for XP, but a later upvote from someone else still doesn't
          // re-trigger it (xp_awarded is already true).
          if (submitterId != null && submitterId !== decoded.userId) {
            await client.query(`UPDATE users SET xp = xp + $1 WHERE id = $2`, [XP_REWARDS.contributionAccepted, submitterId]);
            await client.query(`INSERT INTO xp_events (user_id, amount, source) VALUES ($1, $2, 'contribution_upvoted')`, [submitterId, XP_REWARDS.contributionAccepted]);
          }
        }
      }

      return { variantId: id, up, down, score, myVote };
    });

    if (result.notFound) return Response.json({ error: 'Variant not found' }, { status: 404 });
    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error('Error voting on variant:', err);
    return Response.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
