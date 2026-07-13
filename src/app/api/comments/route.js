import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const RATE_LIMIT_MS = 10_000;

// GET ?wordId=<id> — public comment thread for one word.
// GET ?counts=id1,id2,id3 — public bulk comment counts (dictionary page,
// capped at 60 ids to keep the query bounded).
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const counts = searchParams.get('counts');
    if (counts != null) {
      const ids = counts.split(',').map(s => s.trim()).filter(Boolean).slice(0, 60);
      if (ids.length === 0) return Response.json({}, { status: 200 });
      const result = await query(
        `SELECT word_id, COUNT(*) AS n FROM word_comments WHERE word_id = ANY($1) AND NOT deleted GROUP BY word_id`,
        [ids]
      );
      const map = {};
      for (const row of result.rows) map[row.word_id] = Number(row.n);
      return Response.json(map, { status: 200, headers: { 'Cache-Control': 'public, max-age=60' } });
    }

    const wordId = searchParams.get('wordId');
    if (!wordId) return Response.json({ error: 'wordId is required' }, { status: 400 });
    const sort = searchParams.get('sort') === 'top' ? 'top' : 'recent';

    const result = await query(
      `SELECT wc.id, wc.body, wc.created_at, wc.user_id, u.first_name, u.last_name,
              COUNT(v.id) FILTER (WHERE v.active) AS vote_count
       FROM word_comments wc
       JOIN users u ON u.id = wc.user_id
       LEFT JOIN votes v ON v.target_type = 'comment' AND v.target_id = wc.id
       WHERE wc.word_id = $1 AND NOT wc.deleted
       GROUP BY wc.id, u.first_name, u.last_name
       ORDER BY ${sort === 'top' ? 'vote_count DESC, wc.created_at ASC' : 'wc.created_at ASC'}
       LIMIT 100`,
      [wordId]
    );

    const comments = result.rows.map(r => ({
      id: r.id,
      body: r.body,
      createdAt: r.created_at,
      authorId: r.user_id,
      authorName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'A community member',
      voteCount: Number(r.vote_count),
    }));

    return Response.json(comments, { status: 200, headers: { 'Cache-Control': 'public, max-age=30' } });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return Response.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST {wordId, dialect, body} — post a comment on a word. Lightly
// rate-limited: at most one comment per 10s per user.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { wordId, dialect, body } = await req.json();
    if (!wordId || typeof wordId !== 'string') {
      return Response.json({ error: 'wordId is required' }, { status: 400 });
    }
    const trimmed = (body || '').trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      return Response.json({ error: 'Comment must be between 3 and 500 characters' }, { status: 400 });
    }

    const recent = await query(
      `SELECT created_at FROM word_comments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [decoded.userId]
    );
    if (recent.rows[0] && Date.now() - new Date(recent.rows[0].created_at).getTime() < RATE_LIMIT_MS) {
      return Response.json({ error: 'You are posting too quickly — please wait a moment' }, { status: 429 });
    }

    const userResult = await query(`SELECT deactivated, first_name, last_name FROM users WHERE id = $1`, [decoded.userId]);
    const user = userResult.rows[0];
    if (!user || user.deactivated) {
      return Response.json({ error: 'Account unavailable' }, { status: 403 });
    }

    const inserted = await query(
      `INSERT INTO word_comments (word_id, dialect, user_id, body) VALUES ($1, $2, $3, $4)
       RETURNING id, body, created_at`,
      [wordId, dialect || null, decoded.userId, trimmed]
    );
    const row = inserted.rows[0];

    return Response.json({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      authorId: decoded.userId,
      authorName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'A community member',
    }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return Response.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
