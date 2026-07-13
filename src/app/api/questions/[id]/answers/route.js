import { query, withTransaction } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateAudioFields } from '@/lib/audioValidation';
import { isBlobConfigured, uploadAudio, deleteAudio } from '@/lib/audioStorage';

const MAX_BODY_BYTES = 600_000; // ~400k base64 chars (a ~10s clip) plus JSON overhead

// POST {romanized, chinese, explanation, audioData?, audioMimeType?, durationMs?}
// — answer a question. Optional voice recording reuses the same audio_clips
// table and Blob-upload flow as contribution submissions.
export async function POST(req, { params }) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  const contentLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Request body too large' }, { status: 413 });
  }

  try {
    const { id: questionId } = await params;
    const { romanized, chinese, explanation, audioData, audioMimeType, durationMs } = await req.json();

    const qResult = await query(`SELECT id FROM questions WHERE id = $1`, [questionId]);
    if (qResult.rows.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }

    const trimmedRomanized = (romanized || '').trim();
    if (trimmedRomanized.length < 1 || trimmedRomanized.length > 200) {
      return Response.json({ error: 'romanized is required' }, { status: 400 });
    }

    const recent = await query(
      `SELECT id FROM answers WHERE user_id = $1 AND created_at > NOW() - INTERVAL '15 seconds' LIMIT 1`,
      [decoded.userId]
    );
    if (recent.rows.length > 0) {
      return Response.json({ error: 'You are answering too quickly — please wait a moment' }, { status: 429 });
    }

    if (audioData) {
      const audioError = validateAudioFields(audioData, audioMimeType, durationMs);
      if (audioError) {
        return Response.json({ error: audioError }, { status: 400 });
      }
    }

    const useBlob = audioData && isBlobConfigured();
    const blobUrl = useBlob ? await uploadAudio(audioData, audioMimeType) : null;

    try {
      const answer = await withTransaction(async client => {
        const inserted = await client.query(
          `INSERT INTO answers (question_id, user_id, romanized, chinese, explanation)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, question_id, user_id, romanized, chinese, explanation, created_at`,
          [questionId, decoded.userId, trimmedRomanized, (chinese || '').trim() || null, (explanation || '').trim() || null]
        );
        const answerRow = inserted.rows[0];

        if (audioData) {
          await client.query(
            `INSERT INTO audio_clips (answer_id, mime_type, data, blob_url, duration_ms) VALUES ($1, $2, $3, $4, $5)`,
            [answerRow.id, audioMimeType, useBlob ? null : audioData, blobUrl, Math.round(durationMs)]
          );
        }

        return answerRow;
      });
      return Response.json(answer, { status: 201 });
    } catch (txErr) {
      if (blobUrl) await deleteAudio(blobUrl);
      throw txErr;
    }
  } catch (err) {
    console.error('Error posting answer:', err);
    return Response.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
