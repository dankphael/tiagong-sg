import { query } from '@/lib/db';

// Maps a contribution's `type` to the `word_variants.variant_type` it
// becomes once published. `correction` explodes into the *field* being
// corrected (spelling/romanisation/definition/usage_context) rather than
// the literal string "correction"; `pronunciation_audio` is renamed to
// `pronunciation` — that rename is what the vote route and VariantChips key
// off to find recordings. `error_flag` never becomes a variant (it's a
// report, not content) — callers should skip it before calling this.
export function variantTypeFor(type, payload) {
  const map = {
    correction: payload?.field,
    new_word: 'new_word',
    usage_example: 'usage_example',
    pronunciation_audio: 'pronunciation',
    interpretation: 'interpretation',
  };
  return map[type] || type;
}

// Looks up a user's display name the same way everywhere a contribution
// gets attributed, falling back to an anonymous label. Pass a transaction
// client when called from inside withTransaction (src/lib/db.js) so the
// lookup runs on the same connection as the rest of the write.
export async function resolveContributorName(userId, client) {
  const run = client ? client.query.bind(client) : query;
  const result = await run(`SELECT first_name, last_name FROM users WHERE id = $1`, [userId]);
  const user = result.rows[0];
  return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'A community member' : 'A community member';
}

// Inserts the word_variants row for an accepted/published contribution.
// `contribution` needs id, word_id, dialect, type, payload. Coexists with
// the original entry rather than replacing it — see db/schema.sql.
//
// `xpAwarded` marks whether XP for this variant has already been paid out:
// the custodian-review path (new_word/error_flag) pays XP unconditionally
// on accept, so it passes `true` here to stop the vote route
// (api/recordings/vote/route.js) from paying it again once the variant
// separately crosses the upvote threshold. The instant-publish path
// defaults to `false` since XP there is earned only by community upvotes.
// Pass a transaction client (see resolveContributorName above) when this
// insert must land atomically with the contribution row it belongs to.
export async function insertVariant(contribution, contributorName, { xpAwarded = false } = {}, client) {
  const run = client ? client.query.bind(client) : query;
  await run(
    `INSERT INTO word_variants (contribution_id, word_id, dialect, variant_type, payload, contributor_name, context_note, xp_awarded)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      contribution.id,
      contribution.word_id,
      contribution.dialect,
      variantTypeFor(contribution.type, contribution.payload),
      JSON.stringify(contribution.payload || {}),
      contributorName,
      contribution.payload?.contextNote || null,
      xpAwarded,
    ]
  );
}
