// Matching constants + scoring engine for Sin Seh (mentor) matchmaking.
// Pure functions — operate on already-fetched user profiles, no I/O.

import { interestTags } from "@/data/staticData";

export const INTENTS = [
  { id: "mentorship", label: "Ongoing 1-on-1 Mentorship" },
  { id: "practice", label: "Casual Practice Conversations" },
  { id: "meetup", label: "In-Person Meetups" },
];

export const AVAILABILITY_SLOTS = [
  { id: "weekday_day", label: "Weekday Daytime" },
  { id: "weekday_evening", label: "Weekday Evening" },
  { id: "weekend_day", label: "Weekend Daytime" },
  { id: "weekend_evening", label: "Weekend Evening" },
];

export const FORMATS = [
  { id: "in_person", label: "In Person" },
  { id: "video", label: "Video Call" },
  { id: "voice", label: "Voice Call" },
  { id: "text", label: "Text" },
];

export const REGIONS = [
  { id: "north", label: "North" },
  { id: "northeast", label: "North-East" },
  { id: "east", label: "East" },
  { id: "central", label: "Central" },
  { id: "west", label: "West" },
];

export const PROFICIENCY_LEVELS = [
  { id: "none", label: "Just Starting Out" },
  { id: "basic", label: "Basic Phrases" },
  { id: "conversational", label: "Conversational" },
  { id: "fluent", label: "Fluent" },
];

const INTENT_LABELS = Object.fromEntries(INTENTS.map(i => [i.id, i.label]));
const REGION_LABELS = Object.fromEntries(REGIONS.map(r => [r.id, r.label]));
const FORMAT_LABELS = Object.fromEntries(FORMATS.map(f => [f.id, f.label]));

// scoreMatch(me, candidate) → { score, reasons[] }
// Every field is null-guarded — legacy/incomplete profiles must not sink to
// the bottom, they just accrue fewer signal points.
export function scoreMatch(me, candidate) {
  if (!me || !candidate) return { score: 0, reasons: [] };
  let score = 0;
  const reasons = [];

  if (me.languageInterest && candidate.languageInterest && me.languageInterest === candidate.languageInterest) {
    score += 35;
    reasons.push({ text: `Both interested in ${me.languageInterest}`, weight: 35 });
  }

  const myIntent = me.intent;
  const offerings = Array.isArray(candidate.offerings) ? candidate.offerings : [];
  if (myIntent) {
    if (offerings.length === 0) {
      score += 10;
    } else if (offerings.includes(myIntent)) {
      score += 20;
      reasons.push({ text: `Offers ${INTENT_LABELS[myIntent] || myIntent}`, weight: 20 });
    }
  }

  const myAvail = Array.isArray(me.availability) ? me.availability : [];
  const theirAvail = Array.isArray(candidate.availability) ? candidate.availability : [];
  const sharedAvail = myAvail.filter(a => theirAvail.includes(a));
  if (sharedAvail.length > 0) {
    score += Math.min(sharedAvail.length * 5, 15);
    reasons.push({ text: sharedAvail.length > 1 ? "Both free at overlapping times" : "Both free at the same time", weight: Math.min(sharedAvail.length * 5, 15) });
  }

  if (me.region && candidate.region && me.region === candidate.region) {
    score += 10;
    reasons.push({ text: `Both in the ${REGION_LABELS[me.region] || me.region}`, weight: 10 });
  }

  const myFormats = Array.isArray(me.formats) ? me.formats : [];
  const theirFormats = Array.isArray(candidate.formats) ? candidate.formats : [];
  const sharedFormats = myFormats.filter(f => theirFormats.includes(f));
  if (sharedFormats.length > 0) {
    score += Math.min(sharedFormats.length * 2, 6);
  }

  const myInterests = Array.isArray(me.interests) ? me.interests : [];
  const theirInterests = Array.isArray(candidate.interests) ? candidate.interests : [];
  const sharedInterests = myInterests.filter(i => theirInterests.includes(i));
  if (sharedInterests.length > 0) {
    score += Math.min(sharedInterests.length * 3, 12);
    const emojis = sharedInterests.slice(0, 3).map(id => (INTERESTS_BY_ID[id]?.emoji || "")).join(" ");
    reasons.push({ text: `Shares ${sharedInterests.length} interest${sharedInterests.length > 1 ? "s" : ""} ${emojis}`.trim(), weight: sharedInterests.length * 3 });
  }

  if (candidate.verified) {
    score += 5;
  }

  reasons.sort((a, b) => b.weight - a.weight);
  return { score, reasons: reasons.slice(0, 3).map(r => r.text) };
}

const INTERESTS_BY_ID = Object.fromEntries(interestTags.map(t => [t.id, t]));

// rankSinSehs(me, users) → users sorted best-match-first, each annotated
// with _matchScore and _matchReasons. Ties broken by verified, then menteeCount.
export function rankSinSehs(me, users) {
  if (!Array.isArray(users)) return [];
  return users
    .map(u => {
      const { score, reasons } = scoreMatch(me, u);
      return { ...u, _matchScore: score, _matchReasons: reasons };
    })
    .sort((a, b) => {
      if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
      if (!!b.verified !== !!a.verified) return b.verified ? 1 : -1;
      return (b.menteeCount || 0) - (a.menteeCount || 0);
    });
}

const ICEBREAKERS_GENERIC = [
  "Hi! I'd love to learn more about your dialect journey — how did you get started?",
  "Hello! What's a phrase in your dialect that you think everyone should know?",
  "Hi there — would you be up for a casual chat to see if we're a good fit?",
];

// getIcebreakers(me, other) → a few short conversation-starter suggestions,
// personalized where possible from shared interests/region.
export function getIcebreakers(me, other) {
  const suggestions = [];
  const sharedInterests = (Array.isArray(me?.interests) ? me.interests : [])
    .filter(i => (Array.isArray(other?.interests) ? other.interests : []).includes(i));
  if (sharedInterests.length > 0) {
    const tag = INTERESTS_BY_ID[sharedInterests[0]];
    if (tag) suggestions.push(`I saw we both like ${tag.label.toLowerCase()} ${tag.emoji} — got any favourite spots or stories?`);
  }
  if (me?.region && other?.region && me.region === other.region) {
    suggestions.push(`Looks like we're both in the ${REGION_LABELS[me.region] || me.region} — maybe we could meet up nearby sometime?`);
  }
  if (other?.huayKuan) {
    suggestions.push(`I noticed your huay kuan affiliation — I'd love to hear more about it.`);
  }
  return [...suggestions, ...ICEBREAKERS_GENERIC].slice(0, 3);
}
