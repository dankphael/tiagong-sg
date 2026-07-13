import { query, withTransaction } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { XP_REWARDS } from '@/data/xpSystem';

// PATCH {action: 'accept'|'reject', note} — a custodian reviews a pending
// contribution. Accept inserts a word_variants row (variants coexist with
// the original — they never replace it) and awards XP to the submitter;
// this XP grant is the one server-authoritative exception in the app,
// since the submitter is offline at review time.
export async function PATCH(req, { params }) {
  const { error, status, decoded } = requireAuth(req);
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
    const updatedRow = await withTransaction(async client => {
      const updated = await client.query(
        `UPDATE contributions SET status = $1, reviewer_id = $2, review_note = $3, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND status = 'pending'
         RETURNING id, user_id, type, word_id, dialect, payload, reason, status, review_note, reviewed_at, created_at`,
        [newStatus, decoded.userId, note || null, id]
      );
      if (updated.rows.length === 0) {
        throw Object.assign(new Error('This contribution has already been reviewed'), { httpStatus: 409 });
      }

      if (action === 'accept') {
        if (contribution.type !== 'error_flag') {
          const variantTypeMap = { correction: contribution.payload?.field, new_word: 'new_word', usage_example: 'usage_example', pronunciation_audio: 'pronunciation' };
          const submitterResult = await client.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [contribution.user_id]);
          const submitter = submitterResult.rows[0];
          const contributorName = submitter ? `${submitter.first_name || ''} ${submitter.last_name || ''}`.trim() || 'A community member' : 'A community member';

          await client.query(
            `INSERT INTO word_variants (contribution_id, word_id, dialect, variant_type, payload, contributor_name, context_note)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              contribution.id,
              contribution.word_id,
              contribution.dialect,
              variantTypeMap[contribution.type] || contribution.type,
              JSON.stringify(contribution.payload || {}),
              contributorName,
              contribution.payload?.contextNote || null,
            ]
          );
        }

        await client.query(`UPDATE users SET xp = xp + $1 WHERE id = $2`, [XP_REWARDS.contributionAccepted, contribution.user_id]);
        await client.query(`INSERT INTO xp_events (user_id, amount, source) VALUES ($1, $2, 'contribution_accepted')`, [contribution.user_id, XP_REWARDS.contributionAccepted]);
      }

      return updated.rows[0];
    });

    return Response.json(updatedRow, { status: 200 });
  } catch (err) {
    if (err.httpStatus) return Response.json({ error: err.message }, { status: err.httpStatus });
    console.error('Error reviewing contribution:', err);
    return Response.json({ error: 'Failed to review contribution' }, { status: 500 });
  }
}
