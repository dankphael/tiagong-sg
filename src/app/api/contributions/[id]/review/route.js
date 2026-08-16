import { query, withTransaction } from '@/lib/db';
import { requireActiveAuth } from '@/lib/auth';
import { XP_REWARDS } from '@/data/xpSystem';
import { insertVariant, resolveContributorName } from '@/lib/variants';

// PATCH {action: 'accept'|'reject', note} — a custodian reviews a pending
// contribution. Only 'new_word' (mints a brand-new dictionary card) and
// 'error_flag' (a takedown report) still reach this queue — every other
// contribution type now publishes instantly on submit, see
// api/contributions/route.js. Accept inserts a word_variants row (variants
// coexist with the original — they never replace it) and awards XP to the
// submitter; this XP grant is the one server-authoritative exception for
// new_word/error_flag, since the submitter is offline at review time.
// (Other types award XP when the community upvotes them — see
// api/recordings/vote/route.js.)
export async function PATCH(req, { params }) {
  const { error, status, decoded } = await requireActiveAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;
    const { action, note } = await req.json();

    if (!['accept', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const contributionResult = await query(`SELECT * FROM contributions WHERE id = $1`, [id]);
    if (contributionResult.rows.length === 0) {
      return Response.json({ error: 'Contribution not found' }, { status: 404 });
    }
    const contribution = contributionResult.rows[0];

    if (contribution.status !== 'pending') {
      return Response.json({ error: 'This contribution has already been reviewed' }, { status: 409 });
    }

    const userResult = await query(`SELECT custodian_dialects, account_type FROM users WHERE id = $1`, [decoded.userId]);
    const custodianDialects = userResult.rows[0]?.custodian_dialects || [];
    const isAdmin = userResult.rows[0]?.account_type === 'admin';
    if (!isAdmin && (!Array.isArray(custodianDialects) || !custodianDialects.includes(contribution.dialect))) {
      return Response.json({ error: 'Not authorized to review this dialect' }, { status: 403 });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    // Wrapped in a transaction: previously the status UPDATE, the
    // word_variants insert, and the XP grant were three separate
    // unguarded writes, so a failure between them (e.g. insertVariant
    // throwing) left a contribution permanently 'accepted' with no variant
    // and no XP paid — an unfixable state with no transaction to roll back.
    const updatedRow = await withTransaction(async (client) => {
      const updated = await client.query(
        `UPDATE contributions SET status = $1, reviewer_id = $2, review_note = $3, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, user_id, type, word_id, dialect, payload, reason, status, review_note, reviewed_at, created_at`,
        [newStatus, decoded.userId, note || null, id]
      );

      if (action === 'accept') {
        if (contribution.type !== 'error_flag') {
          const contributorName = await resolveContributorName(contribution.user_id, client);
          // xpAwarded: true — the unconditional XP grant below already pays
          // out for this variant, so the vote route must not pay it again if
          // it also crosses the upvote threshold.
          await insertVariant(contribution, contributorName, { xpAwarded: true }, client);
        }

        await client.query(`UPDATE users SET xp = xp + $1 WHERE id = $2`, [XP_REWARDS.contributionAccepted, contribution.user_id]);
        await client.query(`INSERT INTO xp_events (user_id, amount, source) VALUES ($1, $2, 'contribution_accepted')`, [contribution.user_id, XP_REWARDS.contributionAccepted]);
      }

      return updated.rows[0];
    });

    return Response.json(updatedRow, { status: 200 });
  } catch (err) {
    console.error('Error reviewing contribution:', err);
    return Response.json({ error: 'Failed to review contribution' }, { status: 500 });
  }
}
