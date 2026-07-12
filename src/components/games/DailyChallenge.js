'use client';

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/components/AppProvider";
import { speak } from "@/lib/tts";
import { Trophy, ArrowRight, Repeat, Volume2, Flame } from "lucide-react";
import { XP_REWARDS } from "@/data/xpSystem";
import { buildDailyQuestions } from "@/lib/gameDecks";
import { ResultsScreen } from "@/components/games/GameShared";

export default function DailyChallenge({ dialect, dialectId, autoStart }) {
  const { apiWords, awardXp, streak, xp, dailyCompleted, markDailyComplete } = useApp();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  // Captured at run start so a "Try Again" run started after completion
  // doesn't retroactively lose/gain reward status mid-run.
  const [countsForReward, setCountsForReward] = useState(true);
  const autoStarted = useRef(false);

  function start() {
    setQuestions(buildDailyQuestions(apiWords, dialectId));
    setIndex(0);
    setScore(0);
    setDone(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setCountsForReward(!dailyCompleted);
  }

  useEffect(() => {
    if (autoStart && !autoStarted.current) {
      autoStarted.current = true;
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  if (questions.length === 0 && !done) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Trophy size={56} /></div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>Daily Challenge</h2>
        <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 16, maxWidth: 400, margin: "0 auto 16px" }}>
          {dailyCompleted
            ? `You've already completed today's challenge. Play again for practice — no XP or streak this time.`
            : `10 questions in ${dialect.name}. Test your knowledge and earn bonus XP!`}
        </p>
        <div style={{ background: "#FEF9E2", borderRadius: 12, padding: "12px 20px", marginBottom: 32, display: "inline-block", fontSize: 13, color: "#8B6020" }}>
          <Flame size={16} /> {streak} day streak • {xp} XP total
        </div>
        <br />
        <button className="btn-hover" onClick={start}
          style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {dailyCompleted ? "Practice Again" : "Start Challenge"} <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <ResultsScreen
        title="Challenge Complete!"
        score={score}
        total={questions.length}
        dialectColor={dialect.color}
        extraLine={countsForReward ? `+${score * XP_REWARDS.correctAnswer + XP_REWARDS.dailyComplete} XP earned!` : "Practice run — no XP or streak awarded"}
        actions={[
          {
            label: "Try Again", icon: <Repeat size={15} />, primary: true, onClick: () => {
              setDone(false); setQuestions([]); setIndex(0); setScore(0);
            },
          },
        ]}
      />
    );
  }

  const q = questions[index];
  return (
    <div>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6B5B45" }}>
        <span>Question {index + 1} of {questions.length}</span>
        <span style={{ color: dialect.color, fontWeight: 700 }}>Score: {score}</span>
      </div>
      <div style={{ height: 8, background: "#E8DDD0", borderRadius: 4, marginBottom: 24 }}>
        <div style={{ width: `${((index + 1) / questions.length) * 100}%`, height: "100%", background: dialect.color, borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {/* Question */}
      <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>Translate</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "white" }}>{q.english}</div>
        {q.chinese && <div style={{ fontFamily: "var(--font-chinese)", fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{q.chinese}</div>}
      </div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <button onClick={() => speak(q.options[q.correctIndex] || '', dialectId)}
          style={{ padding: "6px 16px", background: "white", border: `2px solid ${dialect.color}30`, borderRadius: 16, color: dialect.color, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Volume2 size={15} /> Hear answer
        </button>
      </div>

      {/* Options */}
      <div className="answer-grid" style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, idx) => {
          let bg = "white", border = "#E8DDD0", color = "#1A1208";
          if (showResult) {
            if (idx === q.correctIndex) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
            else if (selectedAnswer === idx) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
          }
          return (
            <button key={idx} className="btn-hover" onClick={() => {
              if (showResult) return;
              setSelectedAnswer(idx);
              setShowResult(true);
              if (idx === q.correctIndex) {
                setScore(s => s + 1);
                if (countsForReward) awardXp(XP_REWARDS.correctAnswer, 'correct');
              }
            }}
              style={{ padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 14, cursor: showResult ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
              <div className="romanized" style={{ fontWeight: 700 }}>{opt}</div>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {showResult && (
        <button className="btn-hover" onClick={() => {
          if (index < questions.length - 1) {
            setIndex(i => i + 1);
            setSelectedAnswer(null);
            setShowResult(false);
          } else {
            if (countsForReward) {
              awardXp(XP_REWARDS.dailyComplete, 'daily challenge complete');
              markDailyComplete();
            }
            setDone(true);
          }
        }}
          style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {index < questions.length - 1 ? <>Next <ArrowRight size={15} /></> : <>View Results <ArrowRight size={15} /></>}
        </button>
      )}
    </div>
  );
}
