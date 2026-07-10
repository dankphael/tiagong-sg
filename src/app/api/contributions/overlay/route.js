import { query } from '@/lib/db';

// GET — public overlay of accepted community variants, merged client-side
// over public/dictionary.json. Grouped by word_id; entries with a null
// word_id are accepted brand-new words.
export async function GET() {
  try {
    const result = await query(
      `SELECT id, word_id, dialect, variant_type, payload, contributor_name, context_note, created_at
       FROM word_variants ORDER BY created_at ASC`
    );

    const variants = {};
    const newWords = [];
    for (const row of result.rows) {
      if (row.word_id) {
        if (!variants[row.word_id]) variants[row.word_id] = [];
        variants[row.word_id].push(row);
      } else {
        newWords.push(row);
      }
    }

    return Response.json({ variants, newWords }, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('Error fetching overlay:', error);
    return Response.json({ error: 'Failed to fetch overlay' }, { status: 500 });
  }
}
