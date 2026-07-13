import { query } from '@/lib/db';

// GET — public overlay of accepted community variants, merged client-side
// over public/dictionary.json. Grouped by word_id; entries with a null
// word_id are accepted brand-new words.
export async function GET() {
  try {
    const result = await query(
      `SELECT wv.id, wv.word_id, wv.dialect, wv.variant_type, wv.payload, wv.contributor_name, wv.context_note, wv.created_at,
              COUNT(v.id) FILTER (WHERE v.active) AS vote_count
       FROM word_variants wv
       LEFT JOIN votes v ON v.target_type = 'variant' AND v.target_id = wv.id
       GROUP BY wv.id
       ORDER BY wv.created_at ASC`
    );

    const variants = {};
    const newWords = [];
    for (const row of result.rows) {
      row.vote_count = Number(row.vote_count) || 0;
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
