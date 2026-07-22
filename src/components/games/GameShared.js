'use client';

import {
  Trophy, Languages, Users, Heart, Home, Smile, Plane, Clock,
  Utensils, Briefcase, MapPin, PawPrint, Coffee, User, CupSoda, Handshake,
  Hash, Waves, Car, Palette, Ruler, Flag, PersonStanding, Package, Sparkles,
  Repeat, MessageCircle, ScrollText, BookOpen,
} from "lucide-react";

export const CATEGORY_ICONS = {
  family: Users, body: Heart, daily_life: Home, emotions: Smile, travel: Plane,
  time: Clock, hawker: Utensils, hawker_culture: Utensils, profession: Briefcase,
  place: MapPin, animal: PawPrint, beverage: Coffee, language: Languages,
  other: BookOpen, person: User, drink: CupSoda, politeness: Handshake,
  food: Utensils, numbers: Hash, greetings: Waves, transport: Car, color: Palette,
  size: Ruler, singapore: Flag, verb: PersonStanding, noun: Package,
  adjective: Sparkles, adverb: Repeat, interjection: MessageCircle,
  by_pos: ScrollText,
};

export function gradeFor(pct) {
  if (pct >= 80) return { label: "Excellent!", color: "#1A6B3C", bg: "#EAFAF1" };
  if (pct >= 60) return { label: "Good job!", color: "#8E44AD", bg: "#F5EEF8" };
  return { label: "Keep practising!", color: "#E67E22", bg: "#FEF9E7" };
}

// Shared completion/results screen used by every scored game (Story Quiz,
// Fill in Blank, Speed Round, Daily Challenge, Reverse Cards) so "finishing a
// game" always looks and behaves the same way.
export function ResultsScreen({ title, subtitle, score, total, extraLine, dialectColor = "#C0392B", actions = [] }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = gradeFor(pct);
  return (
    <div style={{ textAlign: "center" }} className="fade-up">
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Trophy size={56} /></div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 7vw, 36px)", color: "#1A1208", marginBottom: 8 }}>{title}</h2>
      {subtitle && <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32 }}>{subtitle}</p>}
      <div style={{ background: grade.bg, border: `2px solid ${grade.color}40`, borderRadius: 20, padding: "32px 24px", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: grade.color, fontFamily: "var(--font-serif)" }}>{score}<span style={{ fontSize: 28 }}>/{total}</span></div>
        <div style={{ fontSize: 20, color: grade.color, fontWeight: 700, marginTop: 4 }}>{grade.label}</div>
        <div style={{ fontSize: 14, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
        {extraLine && <div style={{ fontSize: 14, color: grade.color, fontWeight: 600, marginTop: 8 }}>{extraLine}</div>}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {actions.map((a, i) => (
          <button key={i} className="btn-hover" onClick={a.onClick}
            style={{
              padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 6,
              background: a.primary ? dialectColor : "white",
              color: a.primary ? "white" : dialectColor,
              border: a.primary ? "none" : `2px solid ${dialectColor}`,
            }}>
            {a.icon}{a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
