import { query, withTransaction } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST {answerId} — a custodian (of the question's dialect) or admin turns
// an answer into a normal pending new_word contribution, so it goes through
// the same review queue as any other submission. The audio clip (if any) is
// reused in place — one clip row can be linked to both an answer and a
// contribution — rather than duplicated.
export async function POST(req, { params }) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id: questionId } = await params;
    const { answerId } = await req.json();

    const qResult = await query(`SELECT id, dialect, title FROM questions WHERE id = $1`, [questionId]);
    if (qResult.rows.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }
    const question = qResult.rows[0];

    const userResult = await query(`SELECT custodian_dialects, account_type FROM users WHERE id = $1`, [decoded.userId]);
    const custodianDialects = userResult.rows[0]?.custodian_dialects || [];
    const isAdmin = userResult.rows[0]?.account_type === 'admin';
    if (!isAdmin && (!Array.isArray(custodianDialects) || !custodianDialects.includes(question.dialect))) {
      return Response.json({ error: 'Not authorized to promote answers for this dialect' }, { status: 403 });
    }

    const aResult = await query(`SELECT id, romanized, chinese, explanation FROM answers WHERE id = $1 AND question_id = $2`, [answerId, questionId]);
    if (aResult.rows.length === 0) {
      return Response.json({ error: 'Answer not found' }, { status: 404 });
    }
    const answer = aResult.rows[0];

    const contribution = await withTransaction(async client => {
      const payload = {
        romanized: answer.romanized,
        traditional: answer.chinese || '',
        english: question.title,
        contextNote: answer.explanation || '',
      };

      const inserted = await client.query(
        `INSERT INTO contributions (user_id, type, word_id, dialect, payload, reason)
         VALUES ($1, 'new_word', NULL, $2, $3, $4)
         RETURNING id, user_id, type, word_id, dialect, payload, reason, status, review_note, reviewed_at, created_at`,
        [decoded.userId, question.dialect, JSON.stringify(payload), `Promoted from an Ask a Senior answer`]
      );
      const row = inserted.rows[0];

      const clipResult = await client.query(`SELECT id FROM audio_clips WHERE answer_id = $1`, [answer.id]);
      if (clipResult.rows.length > 0) {
        const clipId = clipResult.rows[0].id;
        await client.query(`UPDATE audio_clips SET contribution_id = $1 WHERE id = $2`, [row.id, clipId]);
        const updated = await client.query(
          `UPDATE contributions SET payload = payload || $1::jsonb WHERE id = $2 RETURNING id, payload`,
          [JSON.stringify({ audioClipId: clipId }), row.id]
        );
        row.payload = updated.rows[0].payload;
      }

      return row;
    });

    return Response.json(contribution, { status: 201 });
  } catch (err) {
    console.error('Error promoting answer:', err);
    return Response.json({ error: 'Failed to promote answer' }, { status: 500 });
  }
}
