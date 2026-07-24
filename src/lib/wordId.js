// Stable, deterministic ids for cards that have no DB-backed word id: static
// lesson phrases (src/data/staticData.js) and accepted community "new word"
// submissions (word_variants rows with a null word_id). Comments, error
// flags, and other community features anchor to `contributions.word_id` /
// `word_comments.word_id`, which are plain VARCHAR(64) with no foreign key —
// so any string works, as long as every user's browser computes the *same*
// id for the *same* phrase (otherwise two people's comments on "identical"
// cards would silently land on different threads).
//
// Namespaced by prefix so a downstream lookup can tell where to resolve an
// id from: "s_" = static lesson phrase, "n_" = community new-word.

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export function staticPhraseId(dialect, category, phrase) {
  return `s_${hash(`${dialect}|${category}|${phrase}`)}`;
}

export function communityWordId(variantId) {
  return `n_${variantId}`;
}

// True for a synthetic id (static lesson phrase or community new-word) that
// won't resolve against public/dictionary.json — custodians reviewing a
// contribution against one of these need a headword snapshot in the payload
// since there's no `apiWords` row to look up.
export function isSyntheticWordId(id) {
  return typeof id === "string" && (id.startsWith("s_") || id.startsWith("n_"));
}
