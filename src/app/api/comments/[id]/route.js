import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// DELETE — soft-delete a comment. Allowed for the author, a custodian of
// that comment's dialect, or an admin (same permission pattern as the
// contribution review route).
export async function DELETE(req, { params }) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;

    const commentResult = await query(`SELECT id, user_id, dialect FROM word_comments WHERE id = $1 AND NOT deleted`, [id]);
    if (commentResult.rows.length === 0) {
      return Response.json({ error: 'Comment not found' }, { status: 404 });
    }
    const comment = commentResult.rows[0];

    if (comment.user_id !== decoded.userId) {
      const userResult = await query(`SELECT custodian_dialects, account_type FROM users WHERE id = $1`, [decoded.userId]);
      const custodianDialects = userResult.rows[0]?.custodian_dialects || [];
      const isAdmin = userResult.rows[0]?.account_type === 'admin';
      const isCustodian = Array.isArray(custodianDialects) && custodianDialects.includes(comment.dialect);
      if (!isAdmin && !isCustodian) {
        return Response.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
      }
    }

    await query(`UPDATE word_comments SET deleted = true WHERE id = $1`, [id]);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return Response.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
