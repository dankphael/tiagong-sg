import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { dialects } from '@/data/staticData';

const VALID_DIALECTS = dialects.map(d => d.id);
const VALID_STATUS = ['open', 'answered'];

// GET ?dialect=&status= — public question board, newest first.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const dialect = searchParams.get('dialect');
    const status = searchParams.get('status');

    let sql = `SELECT q.id, q.dialect, q.title, q.detail, q.status, q.accepted_answer_id, q.created_at,
           u.first_name, u.last_name,
           COUNT(a.id) AS answer_count
           FROM questions q
           JOIN users u ON u.id = q.user_id
           LEFT JOIN answers a ON a.question_id = q.id
           WHERE 1=1`;
    const params = [];
    let n = 1;

    if (dialect && VALID_DIALECTS.includes(dialect)) {
      sql += ` AND q.dialect = $${n}`;
      params.push(dialect);
      n++;
    }
    if (status && VALID_STATUS.includes(status)) {
      sql += ` AND q.status = $${n}`;
      params.push(status);
      n++;
    }

    sql += ` GROUP BY q.id, u.first_name, u.last_name ORDER BY q.created_at DESC LIMIT 50`;

    const result = await query(sql, params);

    const questions = result.rows.map(r => ({
      id: r.id,
      dialect: r.dialect,
      title: r.title,
      detail: r.detail,
      status: r.status,
      acceptedAnswerId: r.accepted_answer_id,
      createdAt: r.created_at,
      askerName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'A community member',
      answerCount: Number(r.answer_count),
    }));

    return Response.json(questions, { status: 200, headers: { 'Cache-Control': 'public, max-age=30' } });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return Response.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST {dialect, title, detail} — ask a new question. Lightly rate-limited,
// same pattern as comments (1 per 30s per user).
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { dialect, title, detail } = await req.json();

    if (!VALID_DIALECTS.includes(dialect)) {
      return Response.json({ error: 'Invalid dialect' }, { status: 400 });
    }
    const trimmedTitle = (title || '').trim();
    if (trimmedTitle.length < 5 || trimmedTitle.length > 200) {
      return Response.json({ error: 'Question must be between 5 and 200 characters' }, { status: 400 });
    }

    const recent = await query(
      `SELECT id FROM questions WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 seconds' LIMIT 1`,
      [decoded.userId]
    );
    if (recent.rows.length > 0) {
      return Response.json({ error: 'You are posting too quickly — please wait a moment' }, { status: 429 });
    }

    const result = await query(
      `INSERT INTO questions (user_id, dialect, title, detail)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, dialect, title, detail, status, accepted_answer_id, created_at`,
      [decoded.userId, dialect, trimmedTitle, (detail || '').trim() || null]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return Response.json({ error: 'Failed to submit question' }, { status: 500 });
  }
}
