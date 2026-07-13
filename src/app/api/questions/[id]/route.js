import { query, withTransaction } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { XP_REWARDS } from '@/data/xpSystem';

// GET — question detail + all answers, with vote counts and audio clip ids.
// Public: the Q&A board is meant to be browsable without signing in.
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const qResult = await query(
      `SELECT q.id, q.dialect, q.title, q.detail, q.status, q.accepted_answer_id, q.created_at,
              q.user_id, u.first_name, u.last_name
       FROM questions q JOIN users u ON u.id = q.user_id WHERE q.id = $1`,
      [id]
    );
    if (qResult.rows.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }
    const q = qResult.rows[0];

    const answersResult = await query(
      `SELECT a.id, a.user_id, a.romanized, a.chinese, a.explanation, a.created_at,
              u.first_name, u.last_name, ac.id AS audio_clip_id, ac.duration_ms,
              COUNT(v.id) FILTER (WHERE v.active) AS vote_count
       FROM answers a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN audio_clips ac ON ac.answer_id = a.id
       LEFT JOIN votes v ON v.target_type = 'answer' AND v.target_id = a.id
       WHERE a.question_id = $1
       GROUP BY a.id, u.first_name, u.last_name, ac.id, ac.duration_ms
       ORDER BY (a.id = $2) DESC, vote_count DESC, a.created_at ASC`,
      [id, q.accepted_answer_id]
    );

    return Response.json({
      id: q.id,
      dialect: q.dialect,
      title: q.title,
      detail: q.detail,
      status: q.status,
      acceptedAnswerId: q.accepted_answer_id,
      createdAt: q.created_at,
      askerId: q.user_id,
      askerName: `${q.first_name || ''} ${q.last_name || ''}`.trim() || 'A community member',
      answers: answersResult.rows.map(r => ({
        id: r.id,
        authorId: r.user_id,
        authorName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'A community member',
        romanized: r.romanized,
        chinese: r.chinese,
        explanation: r.explanation,
        createdAt: r.created_at,
        audioClipId: r.audio_clip_id,
        durationMs: r.duration_ms,
        voteCount: Number(r.vote_count),
      })),
    }, { status: 200, headers: { 'Cache-Control': 'public, max-age=15' } });
  } catch (error) {
    console.error('Error fetching question:', error);
    return Response.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// PATCH {action:'accept', answerId} — the asker accepts an answer, which
// awards XP to the answerer. Only the original asker may accept.
export async function PATCH(req, { params }) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;
    const { action, answerId } = await req.json();

    if (action !== 'accept') {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const qResult = await query(`SELECT user_id, status FROM questions WHERE id = $1`, [id]);
    if (qResult.rows.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }
    const question = qResult.rows[0];
    if (question.user_id !== decoded.userId) {
      return Response.json({ error: 'Only the asker can accept an answer' }, { status: 403 });
    }

    const aResult = await query(`SELECT id, user_id FROM answers WHERE id = $1 AND question_id = $2`, [answerId, id]);
    if (aResult.rows.length === 0) {
      return Response.json({ error: 'Answer not found' }, { status: 404 });
    }
    const answer = aResult.rows[0];

    const updated = await withTransaction(async client => {
      const result = await client.query(
        `UPDATE questions SET status = 'answered', accepted_answer_id = $1
         WHERE id = $2 AND status = 'open'
         RETURNING id, dialect, title, detail, status, accepted_answer_id, created_at`,
        [answerId, id]
      );
      if (result.rows.length === 0) {
        throw Object.assign(new Error('This question already has an accepted answer'), { httpStatus: 409 });
      }

      if (answer.user_id !== decoded.userId) {
        await client.query(`UPDATE users SET xp = xp + $1 WHERE id = $2`, [XP_REWARDS.answerAccepted, answer.user_id]);
        await client.query(`INSERT INTO xp_events (user_id, amount, source) VALUES ($1, $2, 'answer_accepted')`, [answer.user_id, XP_REWARDS.answerAccepted]);
      }

      return result.rows[0];
    });

    return Response.json(updated, { status: 200 });
  } catch (err) {
    if (err.httpStatus) return Response.json({ error: err.message }, { status: err.httpStatus });
    console.error('Error accepting answer:', err);
    return Response.json({ error: 'Failed to accept answer' }, { status: 500 });
  }
}
