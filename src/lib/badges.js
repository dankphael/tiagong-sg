import { getLevel } from "@/data/xpSystem";

// Pure badge computation, shared by the public member page and (later) the
// owner's own profile page — same rules everywhere.
export const BADGE_DEFS = [
  { id: 'first_word', icon: '📝', label: 'First Word', test: c => (c.new_word || 0) >= 1 },
  { id: 'archivist', icon: '📚', label: 'Archivist', test: c => totalAccepted(c) >= 10 },
  { id: 'first_voice', icon: '🎙️', label: 'First Voice', test: c => (c.pronunciation_audio || 0) >= 1 },
  { id: 'chorus', icon: '🎶', label: 'Chorus', test: c => (c.pronunciation_audio || 0) >= 5 },
  { id: 'flame_7', icon: '🔥', label: '7-Day Flame', test: (c, ctx) => (ctx.streak || 0) >= 7 },
  { id: 'flame_30', icon: '🔥', label: '30-Day Flame', test: (c, ctx) => (ctx.streak || 0) >= 30 },
  { id: 'apprentice', icon: '🎓', label: 'Apprentice', test: (c, ctx) => getLevel(ctx.xp || 0).name !== 'Beginner' && getLevel(ctx.xp || 0).minXP >= 300 },
  { id: 'fluent', icon: '🌟', label: 'Fluent', test: (c, ctx) => getLevel(ctx.xp || 0).minXP >= 1500 },
];

function totalAccepted(contributions) {
  return Object.values(contributions || {}).reduce((sum, n) => sum + n, 0);
}

// contributions: {type: count} of ACCEPTED contributions (from
// /api/users/[id]/public). ctx: {xp, streak}.
export function computeBadges(contributions, ctx = {}) {
  return BADGE_DEFS.filter(b => b.test(contributions || {}, ctx));
}
