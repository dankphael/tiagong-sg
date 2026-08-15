import { query } from '@/lib/db';

// GET — public overlay of published/accepted community variants, merged
// client-side over public/dictionary.json. Grouped by word_id; entries with
// a null word_id are new words. Every variant carries an aggregate up/down
// tally and score — not just recordings — since the community's votes now
// decide what's shown for every contribution type (see
// api/recordings/vote/route.js).
export async function GET() {
  try {
    const result = await query(
      `SELECT wv.id, wv.word_id, wv.dialect, wv.variant_type, wv.payload, wv.contributor_name, wv.context_note, wv.created_at,
              COALESCE(rv.up, 0) AS up, COALESCE(rv.down, 0) AS down
       FROM word_variants wv
       LEFT JOIN (
         SELECT variant_id,
                COUNT(*) FILTER (WHERE value = 1) AS up,
                COUNT(*) FILTER (WHERE value = -1) AS down
         FROM recording_votes GROUP BY variant_id
       ) rv ON rv.variant_id = wv.id
       ORDER BY wv.created_at ASC`
    );

    const variants = {};
    const newWords = [];
    for (const row of result.rows) {
      row.up = Number(row.up);
      row.down = Number(row.down);
      row.score = row.up - row.down;
      if (row.word_id) {
        if (!variants[row.word_id]) variants[row.word_id] = [];
        variants[row.word_id].push(row);
      } else {
        newWords.push(row);
      }
    }
    for (const wordId of Object.keys(variants)) {
      variants[wordId].sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return Response.json({ variants, newWords }, {
      status: 200,
      // Short TTL — most contribution types now publish instantly (see
      // api/contributions/route.js), and a submitter should see their own
      // work land without waiting minutes for a stale cache to expire.
      headers: { 'Cache-Control': 'public, max-age=30' },
    });
  } catch (error) {
    console.error('Error fetching overlay:', error);
    return Response.json({ error: 'Failed to fetch overlay' }, { status: 500 });
  }
}
