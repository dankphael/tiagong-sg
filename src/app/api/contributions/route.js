import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { dialects } from '@/data/staticData';

const VALID_DIALECTS = dialects.map(d => d.id);
const VALID_TYPES = ['correction', 'new_word', 'usage_example', 'error_flag'];
const VALID_CORRECTION_FIELDS = ['spelling', 'romanisation', 'definition', 'usage_context'];

function validatePayload(type, payload) {
  if (!payload || typeof payload !== 'object') return 'Missing payload';
  if (type === 'correction') {
    if (!VALID_CORRECTION_FIELDS.includes(payload.field)) return 'Invalid correction field';
    if (!payload.proposedValue) return 'proposedValue is required';
  } else if (type === 'new_word') {
    if (!payload.romanized && !payload.traditional) return 'A new word needs at least a romanized or traditional form';
  } else if (type === 'usage_example') {
    if (!payload.exampleText) return 'exampleText is required';
  } else if (type === 'error_flag') {
    if (!payload.description) return 'description is required';
  }
  return null;
}

// POST — submit a contribution (correction, new word, usage example, or error flag)
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { type, wordId, dialect, payload, reason } = await req.json();

    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: 'Invalid contribution type' }, { status: 400 });
    }
    if (!VALID_DIALECTS.includes(dialect)) {
      return Response.json({ error: 'Invalid dialect' }, { status: 400 });
    }
    if (type !== 'new_word' && !wordId) {
      return Response.json({ error: 'wordId is required for this contribution type' }, { status: 400 });
    }
    const payloadError = validatePayload(type, payload);
    if (payloadError) {
      return Response.json({ error: payloadError }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO contributions (user_id, type, word_id, dialect, payload, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, type, word_id, dialect, payload, reason, status, review_note, reviewed_at, created_at`,
      [decoded.userId, type, wordId || null, dialect, JSON.stringify(payload || {}), reason || null]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Error creating contribution:', err);
    return Response.json({ error: 'Failed to submit contribution' }, { status: 500 });
  }
}

// GET — the caller's own submissions, newest first
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT id, type, word_id, dialect, payload, reason, status, review_note, reviewed_at, created_at
       FROM contributions WHERE user_id = $1 ORDER BY created_at DESC`,
      [decoded.userId]
    );

    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching contributions:', err);
    return Response.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
