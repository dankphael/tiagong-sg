import { query, withTransaction } from '@/lib/db';
import { requireActiveAuth } from '@/lib/auth';

// DELETE — an admin or a custodian of the variant's dialect removes a
// published community contribution (audio, correction, example,
// interpretation) that needs to come down regardless of vote count — abuse,
// spam, doxxing. Downvoting sinks and hides a variant on its own (see
// VariantChips.HIDDEN_SCORE_THRESHOLD); this is the harder backstop for
// content that can't wait for votes. Deletes the word_variants row
// (cascading its recording_votes) and marks the parent contribution
// 'removed' so api/audio/[id] stops serving any attached clip publicly.
export async function DELETE(req, { params }) {
  const { error, status, decoded } = await requireActiveAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;

    const variantResult = await query(`SELECT id, dialect, contribution_id FROM word_variants WHERE id = $1`, [id]);
    if (variantResult.rows.length === 0) {
      return Response.json({ error: 'Variant not found' }, { status: 404 });
    }
    const variant = variantResult.rows[0];

    const userResult = await query(`SELECT custodian_dialects, account_type FROM users WHERE id = $1`, [decoded.userId]);
    const custodianDialects = userResult.rows[0]?.custodian_dialects || [];
    const isAdmin = userResult.rows[0]?.account_type === 'admin';
    if (!isAdmin && (!Array.isArray(custodianDialects) || !custodianDialects.includes(variant.dialect))) {
      return Response.json({ error: 'Not authorized to remove content for this dialect' }, { status: 403 });
    }

    await withTransaction(async (client) => {
      await client.query(`DELETE FROM word_variants WHERE id = $1`, [id]);
      if (variant.contribution_id != null) {
        await client.query(`UPDATE contributions SET status = 'removed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [variant.contribution_id]);
      }
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Error removing variant:', err);
    return Response.json({ error: 'Failed to remove variant' }, { status: 500 });
  }
}
