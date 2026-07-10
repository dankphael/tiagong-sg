// Matching constants + scoring engine for Sin Seh (mentor) matchmaking.
// Pure functions — operate on already-fetched user profiles, no I/O.

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
