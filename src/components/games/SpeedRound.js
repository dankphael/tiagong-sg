'use client';

import { useState, useEffect } from "react";
import { useApp } from "@/components/AppProvider";
import { Zap, ArrowRight, Repeat } from "lucide-react";
import { XP_REWARDS } from "@/data/xpSystem";
import { buildSpeedQuestions } from "@/lib/gameDecks";
import { ResultsScreen } from "@/components/games/GameShared";

export default function SpeedRound({ dialect, dialectId }) {
  const { apiWords, awardXp } = useApp();
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [active, setActive] = useState(false);

  function start() {
    setQuestions(buildSpeedQuestions(apiWords, dialectId));
    setQuestionIdx(0);
    setScore(0);
    setTimeLeft(60);
    setActive(true);
  }

  // Stop the clock once every question has been answered, so the timer
  // doesn't keep ticking behind the results screen.
  useEffect(() => {
    if (active && questions.length > 0 && questionIdx >= questions.length) {
      setActive(false);
    }
  }, [questionIdx, questions.length, active]);

  // Timer
  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  if (!active && questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Zap size={56} /></div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>Speed Round</h2>
        <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          Answer as many questions as you can in 60 seconds! +10 XP per correct answer, +15 for speed bonus.
        </p>
        <button className="btn-hover" onClick={start}
          style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Start Speed Round <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  if (timeLeft <= 0 || questionIdx >= questions.length) {
    return (
      <ResultsScreen
        title="Time's Up!"
        score={score}
        total={questions.length}
        dialectColor={dialect.color}
        extraLine={`+${score * XP_REWARDS.speedRoundCorrect} XP earned!`}
        actions={[
          {
            label: "Try Again", icon: <Repeat size={15} />, primary: true, onClick: () => {
              setActive(false); setQuestions([]); setScore(0); setQuestionIdx(0); setTimeLeft(60);
            },
          },
        ]}
      />
    );
  }

  const q = questions[questionIdx];
  return (
    <div>
      {/* Timer bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6B5B45" }}>
          <span>Question {questionIdx + 1} of {questions.length}</span>
          <span style={{ color: timeLeft <= 10 ? "#C0392B" : dialect.color, fontWeight: 700, fontSize: 16 }}>{timeLeft}s</span>
        </div>
        <div style={{ height: 8, background: "#E8DDD0", borderRadius: 4 }}>
          <div style={{ width: `${(timeLeft / 60) * 100}%`, height: "100%", background: timeLeft <= 10 ? "#C0392B" : dialect.color, borderRadius: 4, transition: "width 1s linear" }} />
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "6px 16px", fontSize: 14, fontWeight: 700, color: dialect.color }}>
          Score: {score}
        </span>
      </div>

      {/* Question */}
      <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>What is this in {dialect.name}?</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 700, color: "white" }}>{q.english}</div>
        {q.chinese && <div style={{ fontFamily: "var(--font-chinese)", fontSize: 20, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{q.chinese}</div>}
        {(q.ipa || q.pos) && (
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
            {q.ipa && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>{q.ipa}</span>}
            {q.pos && <span style={{ fontSize: 10, background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 8 }}>{q.pos}</span>}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="answer-grid" style={{ display: "grid", gap: 10 }}>
        {q.options.map((opt, idx) => (
          <button key={idx} className="btn-hover" onClick={() => {
            const correct = idx === q.correctIndex;
            if (correct) {
              setScore(s => s + 1);
              awardXp(XP_REWARDS.speedRoundCorrect, 'speed round');
            }
            setQuestionIdx(i => i + 1);
          }}
            style={{ padding: "14px 16px", background: "white", border: `2px solid #E8DDD0`, borderRadius: 12, fontSize: 14, cursor: "pointer", color: "#1A1208", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
            <div className="romanized" style={{ fontWeight: 700 }}>{opt}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
