'use client';

import { useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Search, Flame, Users, Sparkles, PenLine, Landmark, UserCircle, ArrowRight,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { SealChip } from "@/components/ui";
import { dialects } from "@/data/staticData";
import { LEVELS } from "@/data/xpSystem";

const GUIDE_NUDGE_DISMISSED_KEY = 'tiagong_guide_nudge_dismissed';

const SECTIONS = [
  {
    icon: BookOpen,
    title: "Learn a dialect",
    href: "/learn",
    cta: "Start learning",
    body: "Pick one of five dialects — Hokkien, Cantonese, Teochew, Hakka, or Hainanese — and work through flashcards with real pronunciation audio. Flip a card to see the meaning, tap \"Hear it\" to listen, and mark cards you've got down.",
    bullets: [
      "Flashcards, quizzes, and a daily challenge to build a streak",
      "\"Review weak cards\" brings back anything you haven't marked as known",
      "Switch dialects any time — your progress in each is saved separately",
    ],
  },
  {
    icon: Search,
    title: "Search the dictionary",
    href: "/dictionary",
    cta: "Open the dictionary",
    body: "One search box covers all five dialects at once. Open any word to see its meaning, example sentences, and community-contributed pronunciation recordings.",
    bullets: [
      "See a word used the way your family might say it, with recordings",
      "Suggest an edit, add an example, or flag something that looks wrong",
    ],
  },
  {
    icon: Flame,
    title: "Earn XP and keep a streak",
    href: "/profile",
    cta: "See your progress",
    body: "Every lesson, accepted word contribution, and upvoted comment earns XP. Levels up as you go — collect a badge and a title as you climb.",
    bullets: [
      "Come back daily to keep your streak flame lit",
      "Your level and XP show on your profile and public member page",
    ],
  },
  {
    icon: Users,
    title: "Find a Sin Seh (mentor)",
    href: "/network",
    cta: "Browse the network",
    body: "Sin Sehs (先生) are experienced speakers who volunteer to mentor learners. Browse the directory, send a connection request, and once accepted, chat right in the app — even propose a coffee meetup.",
    bullets: [
      "Filter by dialect, role, and what you're looking for",
      "Chat and meetup proposals happen after a connection is accepted",
    ],
  },
  {
    icon: Sparkles,
    title: "Join the community",
    href: "/community",
    cta: "See what's happening",
    body: "A live feed of what's happening across the platform — new words added, recordings submitted, members joining — plus a weekly leaderboard for top learners and contributors.",
    bullets: [
      "See who's actively building the dictionary",
      "Every member has a public profile you can view and celebrate",
    ],
  },
  {
    icon: PenLine,
    title: "Contribute words",
    href: "/contribute",
    cta: "Add a word",
    body: "Know a word, phrase, or pronunciation that isn't in the dictionary yet? A simple step-by-step form walks you through adding it — typing it out, explaining the meaning, and optionally recording yourself saying it out loud.",
    bullets: [
      "Language Custodians (dialect experts) review every submission before it goes live",
      "Apply to become a Custodian yourself if you're a confident native speaker",
    ],
  },
  {
    icon: Landmark,
    title: "Explore the culture",
    href: "/singlish",
    cta: "See Singlish origins",
    body: "Dialect words are woven through everyday Singlish — discover where your favourite phrases really come from. Or read about the huay kuan (会馆), the clan associations that have guarded language and heritage since the 1800s.",
    bullets: [
      "Dialects in Singlish — familiar words, dialect roots",
      "Clan Associations — history, addresses, and how to get involved",
    ],
    secondaryHref: "/associations",
    secondaryCta: "Clan Associations",
  },
  {
    icon: UserCircle,
    title: "Set up your profile",
    href: "/profile",
    cta: "Edit your profile",
    body: "Add a photo, list the dialects you already know, and set your matchmaking preferences so mentors and learners can find each other. Your profile also has a public page other members can view.",
    bullets: [
      "Upload a profile photo any time — it appears everywhere your emoji avatar did",
      "Matchmaking preferences help the Network page suggest better matches",
    ],
  },
];

export default function GuidePage() {
  const { currentUser } = useApp();

  // Visiting the guide counts as "seen it" — the home page nudge won't show again.
  useEffect(() => {
    localStorage.setItem(GUIDE_NUDGE_DISMISSED_KEY, '1');
  }, []);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Getting Started</div>
        <h1 className="display-1" style={{ fontSize: 40, marginBottom: 16 }}>Welcome to tiagong.sg</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          A language lost is a worldview lost. This is a quick tour of everything you can do here —
          learn a dialect, search the archive, meet a mentor, and help grow the record for
          everyone after you.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
        {dialects.map(d => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 6px", borderRadius: 20, background: d.bg, border: `1px solid ${d.color}30` }}>
            <SealChip dialect={d} size="sm" />
            <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="card" style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-primary)15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--color-primary)", fontWeight: 700 }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--color-text-faint)", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>
                    Step {i + 1}
                  </div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--color-text)" }}>{s.title}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.7, marginBottom: 12 }}>{s.body}</p>
              <ul style={{ margin: "0 0 20px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {s.bullets.map(b => (
                  <li key={b} style={{ fontSize: 13, color: "var(--color-text-muted)", display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--color-primary)" }}>·</span> {b}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href={s.href} className="btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {s.cta} <ArrowRight size={14} />
                </Link>
                {s.secondaryHref && (
                  <Link href={s.secondaryHref} className="btn-ghost" style={{ textDecoration: "none" }}>
                    {s.secondaryCta}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--color-primary)", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>
          Levels along the way
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {LEVELS.map(l => (
            <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: l.color + "15", color: l.color, fontWeight: 700, fontSize: 13 }}>
              <span>{l.icon}</span> {l.name}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginTop: 20, textAlign: "center", background: "linear-gradient(135deg, #1A1208 0%, #2C1810 100%)", border: "1px solid #3D2A18" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#F5E6C8", marginBottom: 8 }}>Ready?</div>
        <p style={{ color: "#B79A78", fontSize: 14, marginBottom: 20 }}>Start with today's challenge, or take the 2-minute intro if you haven't yet.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/learn" className="btn-primary" style={{ textDecoration: "none" }}>Start Learning</Link>
          {!currentUser && (
            <Link href="/welcome" className="btn-secondary" style={{ textDecoration: "none" }}>Take the 2-minute intro</Link>
          )}
        </div>
      </div>
    </div>
  );
}
