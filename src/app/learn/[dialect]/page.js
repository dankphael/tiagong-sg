'use client';

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { getLevel, getNextLevel, getLevelProgress } from "@/data/xpSystem";
import { dialects } from "@/data/staticData";
import DialectSwitcher from "@/components/DialectSwitcher";
import Flashcards from "@/components/games/Flashcards";
import StoryQuiz from "@/components/games/StoryQuiz";
import FillInBlank from "@/components/games/FillInBlank";
import SpeedRound from "@/components/games/SpeedRound";
import DailyChallenge from "@/components/games/DailyChallenge";
import ReverseCards from "@/components/games/ReverseCards";
import Review from "@/components/games/Review";
import {
  ArrowLeft, BookOpen, Clapperboard, PenLine, Zap, Trophy, Repeat, Flame, Star,
} from "lucide-react";

const MODES = [
  { mode: "flashcards", icon: BookOpen, label: "Flashcards", desc: "Tap to flip & learn" },
  { mode: "situational-quiz", icon: Clapperboard, label: "Story Quiz", desc: "Real-life scenarios" },
  { mode: "completing-sentence", icon: PenLine, label: "Fill in Blank", desc: "Complete sentences" },
  { mode: "speed-round", icon: Zap, label: "Speed Round", desc: "60s rapid fire" },
  { mode: "daily-challenge", icon: Trophy, label: "Daily Challenge", desc: "10 questions" },
  { mode: "reverse-cards", icon: Repeat, label: "Reverse Cards", desc: "English → dialect" },
  { mode: "review", icon: Star, label: "Review", desc: "Cards you don't know yet" },
];

const VALID_MODES = MODES.map(m => m.mode);

function LearnDialectContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialectId = params.dialect;
  const dialect = dialects.find(d => d.id === dialectId);

  const { xp, streak, setSelectedDialect } = useApp();

  useEffect(() => {
    if (dialect) setSelectedDialect(dialect.id);
  }, [dialect, setSelectedDialect]);

  const [lessonMode, setLessonMode] = useState("flashcards");
  const [selectedCategory, setSelectedCategory] = useState("greetings");
  // Which mode (if any) should auto-start itself from a deep link, e.g.
  // /learn/hokkien?mode=daily-challenge from the home dashboard's "Today's
  // Challenge" card. Read once — after that, switching modes normally
  // via the mode grid should never auto-start anything.
  const [autoStartMode, setAutoStartMode] = useState(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode && VALID_MODES.includes(mode)) {
      setLessonMode(mode);
      setAutoStartMode(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!dialect) {
    notFound();
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

      {/* Dialect Header — compact */}
      <div style={{ background: `linear-gradient(135deg, ${dialect.color}18, ${dialect.color}08)`, border: `1.5px solid ${dialect.color}30`, borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
        <DialectSwitcher dialect={dialect} />
        <button className="btn-secondary" onClick={() => router.push("/learn")} style={{ fontSize: 13, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {/* Mode Selector — card grid */}
      <div className="mode-grid" style={{ marginBottom: 32 }}>
        {MODES.map(({ mode, icon: Icon, label, desc }) => (
          <button key={mode} className="tab-btn" onClick={() => setLessonMode(mode)} style={{
            padding: "14px 10px", borderRadius: "var(--radius-md)",
            background: lessonMode === mode ? dialect.color : "var(--color-surface)",
            color: lessonMode === mode ? "white" : "var(--color-text-secondary)",
            border: `2px solid ${lessonMode === mode ? dialect.color : "var(--color-border)"}`,
            textAlign: "center", boxShadow: lessonMode === mode ? `0 4px 16px ${dialect.color}40` : "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <Icon size={22} style={{ marginBottom: 4 }} />
            <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{desc}</div>
          </button>
        ))}
      </div>

      {/* Every game mounts exclusively — switching modes unmounts the
          previous game, which resets all of its state for free. */}
      {lessonMode === "flashcards" && (
        <Flashcards dialect={dialect} dialectId={dialectId} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} onSwitchMode={setLessonMode} />
      )}
      {lessonMode === "situational-quiz" && (
        <StoryQuiz dialect={dialect} dialectId={dialectId} onSwitchMode={setLessonMode} />
      )}
      {lessonMode === "completing-sentence" && (
        <FillInBlank dialect={dialect} dialectId={dialectId} onSwitchMode={setLessonMode} />
      )}
      {lessonMode === "speed-round" && (
        <SpeedRound dialect={dialect} dialectId={dialectId} />
      )}
      {lessonMode === "daily-challenge" && (
        <DailyChallenge dialect={dialect} dialectId={dialectId} autoStart={autoStartMode === "daily-challenge"} />
      )}
      {lessonMode === "reverse-cards" && (
        <ReverseCards dialect={dialect} dialectId={dialectId} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} autoStart={autoStartMode === "reverse-cards"} onSwitchMode={setLessonMode} />
      )}
      {lessonMode === "review" && (
        <Review dialect={dialect} dialectId={dialectId} autoStart={autoStartMode === "review"} />
      )}

      {/* XP Bar */}
      <div style={{ marginTop: 32, background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #F0E8DA" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{getLevel(xp).icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1A1208" }}>{getLevel(xp).name}</span>
            <span style={{ fontSize: 12, color: "#8B7355" }}>• {xp} XP</span>
          </div>
          <div style={{ fontSize: 12, color: "#8B7355" }}>
            {getNextLevel(xp) ? `${getNextLevel(xp).minXP - xp} XP to ${getNextLevel(xp).name}` : "Max Level!"}
          </div>
        </div>
        <div style={{ height: 8, background: "#F0E8DA", borderRadius: 4 }}>
          <div style={{ width: `${getLevelProgress(xp)}%`, height: "100%", background: getLevel(xp).color, borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
        {streak > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#D4860B", fontWeight: 600 }}>
            <Flame size={16} /> {streak} day streak
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnDialectPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }} />}>
      <LearnDialectContent />
    </Suspense>
  );
}
