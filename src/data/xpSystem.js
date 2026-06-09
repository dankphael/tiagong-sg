// XP and Level system for tiagong-sg

export const LEVELS = [
  { name: "Beginner", minXP: 0, icon: "🌱", color: "#8B7355" },
  { name: "Learner", minXP: 100, icon: "📖", color: "#2980B9" },
  { name: "Apprentice", minXP: 300, icon: "🎓", color: "#1A7EA6" },
  { name: "Speaker", minXP: 600, icon: "🗣️", color: "#D4860B" },
  { name: "Conversational", minXP: 1000, icon: "💬", color: "#8E44AD" },
  { name: "Fluent", minXP: 1500, icon: "🌟", color: "#C0392B" },
  { name: "Dialect Master", minXP: 2500, icon: "🏆", color: "#F39C12" },
];

export function getLevel(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
  }
  return current;
}

export function getNextLevel(xp) {
  for (const level of LEVELS) {
    if (xp < level.minXP) return level;
  }
  return null; // max level
}

export function getLevelProgress(xp) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

export const XP_REWARDS = {
  correctAnswer: 10,
  wrongAnswer: 2,
  streakBonus: 5,
  categoryComplete: 50,
  dailyComplete: 30,
  speedRoundCorrect: 15,
  storyComplete: 40,
};

export function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const sorted = [...completedDates].sort((a, b) => new Date(b) - new Date(a));
  
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (diffDays === streak) {
      streak++;
    } else if (diffDays === streak + 1 && i === 0) {
      // Allow yesterday to count as streak start
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getDailyChallengeSeed() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Seeded random for daily challenges
export function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function() {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}
