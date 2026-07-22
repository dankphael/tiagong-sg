import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const {
      lastDialect, lastCategory, lessonMode,
      cardIndex, knownCards, completedCategories,
      situationalQuizIndex, situationalCueIndex, situationalScore,
      sentenceIndex, sentenceScore,
    } = await req.json();

    const progress = {
      lastDialect, lastCategory, lessonMode,
      cardIndex, knownCards, completedCategories,
      situationalQuizIndex, situationalCueIndex, situationalScore,
      sentenceIndex, sentenceScore,
    };

    await query(
      `UPDATE users SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [JSON.stringify(progress), decoded.userId]
    );

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error saving progress:', err);
    return Response.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
