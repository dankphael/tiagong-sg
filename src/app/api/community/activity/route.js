import { query } from '@/lib/db';

const KIND_LABELS = {
  new_word: 'added a word',
  usage_example: 'added a usage example',
  pronunciation: 'recorded a pronunciation',
  spelling: 'suggested a correction',
  romanisation: 'suggested a correction',
  definition: 'suggested a correction',
  usage_context: 'suggested a correction',
};

// GET — public recent-activity feed for the /community page and the home
// strip: accepted contributions (word_variants, which only exist for
// accepted ones) plus new members. Two separate queries unioned in JS
// (simpler than a SQL UNION across differently-shaped tables) and merged by
// timestamp, newest first, capped at 30.
export async function GET() {
  try {
    const [variants, members] = await Promise.all([
      query(
        `SELECT wv.word_id, wv.dialect, wv.variant_type, wv.contributor_name, wv.created_at, c.user_id
         FROM word_variants wv
         JOIN contributions c ON c.id = wv.contribution_id
         ORDER BY wv.created_at DESC LIMIT 20`
      ),
      query(
        `SELECT id, first_name, dialect_group, created_at FROM users
         WHERE NOT COALESCE(deactivated, false)
         ORDER BY created_at DESC LIMIT 10`
      ),
    ]);

    const items = [
      ...variants.rows.map(r => ({
        kind: r.variant_type === 'pronunciation' ? 'pronunciation' : 'contribution',
        label: KIND_LABELS[r.variant_type] || 'contributed',
        userId: r.user_id,
        name: r.contributor_name || 'A community member',
        dialect: r.dialect,
        wordId: r.word_id,
        at: r.created_at,
      })),
      ...members.rows.map(r => ({
        kind: 'new_member',
        label: 'joined tiagong.sg',
        userId: r.id,
        name: r.first_name || 'A new member',
        dialect: r.dialect_group || null,
        wordId: null,
        at: r.created_at,
      })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 30);

    return Response.json(items, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (error) {
    console.error('Error fetching community activity:', error);
    return Response.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
