import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET — the caller's saved word ids (dictionary entries, static lesson
// phrases, and community new-words alike — all addressed by the same
// word_id string space).
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT word_id, dialect, created_at FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC`,
      [decoded.userId]
    );
    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    return Response.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// POST {wordId, dialect} — save a word.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { wordId, dialect } = await req.json();
    if (!wordId || typeof wordId !== 'string') {
      return Response.json({ error: 'wordId is required' }, { status: 400 });
    }

    await query(
      `INSERT INTO bookmarks (user_id, word_id, dialect) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, word_id) DO NOTHING`,
      [decoded.userId, wordId, dialect || null]
    );

    return Response.json({ wordId }, { status: 201 });
  } catch (err) {
    console.error('Error saving bookmark:', err);
    return Response.json({ error: 'Failed to save bookmark' }, { status: 500 });
  }
}

// DELETE ?wordId= — remove a saved word.
export async function DELETE(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const wordId = searchParams.get('wordId');
    if (!wordId) return Response.json({ error: 'wordId is required' }, { status: 400 });

    await query(`DELETE FROM bookmarks WHERE user_id = $1 AND word_id = $2`, [decoded.userId, wordId]);
    return Response.json({ wordId }, { status: 200 });
  } catch (err) {
    console.error('Error removing bookmark:', err);
    return Response.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
