import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { dialects } from '@/data/staticData';

const VALID_DIALECTS = dialects.map(d => d.id);
const VALID_TYPES = ['correction', 'new_word', 'usage_example', 'error_flag', 'pronunciation_audio'];
const VALID_CORRECTION_FIELDS = ['spelling', 'romanisation', 'definition', 'usage_context'];
const VALID_AUDIO_MIME_TYPES = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];
const MAX_AUDIO_BASE64_CHARS = 400_000; // ~300KB decoded, generous for a ~10s clip
const MAX_AUDIO_DURATION_MS = 11_000;

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
  // pronunciation_audio: payload only carries an optional contextNote —
  // the actual audio is validated separately in POST (audioData/
  // audioMimeType/durationMs are top-level fields, not part of payload).
  return null;
}

function validateAudioFields(audioData, audioMimeType, durationMs) {
  if (typeof audioData !== 'string' || audioData.length === 0) return 'audioData is required';
  if (audioData.length > MAX_AUDIO_BASE64_CHARS) return 'Recording is too large (max ~10 seconds)';
  if (!VALID_AUDIO_MIME_TYPES.includes(audioMimeType)) return 'Invalid audio format';
  if (typeof durationMs !== 'number' || durationMs <= 0 || durationMs > MAX_AUDIO_DURATION_MS) return 'Invalid recording duration';
  return null;
}

// POST — submit a contribution (correction, new word, usage example, or error flag)
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { type, wordId, dialect, payload, reason, audioData, audioMimeType, durationMs } = await req.json();

    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: 'Invalid contribution type' }, { status: 400 });
    }
    if (!VALID_DIALECTS.includes(dialect)) {
      return Response.json({ error: 'Invalid dialect' }, { status: 400 });
    }
    if (type !== 'new_word' && type !== 'error_flag' && !wordId) {
      return Response.json({ error: 'wordId is required for this contribution type' }, { status: 400 });
    }
    const payloadError = validatePayload(type, payload);
    if (payloadError) {
      return Response.json({ error: payloadError }, { status: 400 });
    }

    if (type === 'pronunciation_audio') {
      const audioError = validateAudioFields(audioData, audioMimeType, durationMs);
      if (audioError) {
        return Response.json({ error: audioError }, { status: 400 });
      }

      // Server builds the payload itself — only contextNote comes from the
      // client; audioClipId is set after the clip is inserted, never trusted
      // from the request. Sequential statements on the same pooled
      // connection (pg Pool max:1) so this is effectively transactional;
      // wrapped in BEGIN/COMMIT/ROLLBACK to avoid an orphaned clip on error.
      await query('BEGIN');
      try {
        const contributionResult = await query(
          `INSERT INTO contributions (user_id, type, word_id, dialect, payload, reason)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [decoded.userId, type, wordId, dialect, JSON.stringify({ contextNote: payload?.contextNote || null }), reason || null]
        );
        const contributionId = contributionResult.rows[0].id;

        const clipResult = await query(
          `INSERT INTO audio_clips (contribution_id, mime_type, data, duration_ms) VALUES ($1, $2, $3, $4) RETURNING id`,
          [contributionId, audioMimeType, audioData, Math.round(durationMs)]
        );
        const audioClipId = clipResult.rows[0].id;

        const updated = await query(
          `UPDATE contributions SET payload = payload || $1::jsonb WHERE id = $2
           RETURNING id, user_id, type, word_id, dialect, payload, reason, status, review_note, reviewed_at, created_at`,
          [JSON.stringify({ audioClipId }), contributionId]
        );
        await query('COMMIT');
        return Response.json(updated.rows[0], { status: 201 });
      } catch (txErr) {
        await query('ROLLBACK');
        throw txErr;
      }
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
      `SELECT c.id, c.type, c.word_id, c.dialect, c.payload, c.reason, c.status, c.review_note, c.reviewed_at, c.created_at, ac.duration_ms
       FROM contributions c
       LEFT JOIN audio_clips ac ON ac.contribution_id = c.id
       WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
      [decoded.userId]
    );

    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching contributions:', err);
    return Response.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
