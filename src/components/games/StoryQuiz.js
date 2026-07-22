'use client';

import { useState } from "react";
import { speak } from "@/lib/tts";
import { AnnotatedText, DialectTooltip } from "@/components/ui";
import { ArrowRight, MessageCircle, Repeat, Volume2 } from "lucide-react";
import { situationalQuizzes } from "@/data/staticData";
import { ResultsScreen } from "@/components/games/GameShared";
import ReportButton from "@/components/games/ReportButton";

export default function StoryQuiz({ dialect, dialectId, onSwitchMode }) {
  const [quizIndex, setQuizIndex] = useState(0);
  const [cueIndex, setCueIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const quizzes = situationalQuizzes[dialectId] || [];
  if (quizzes.length === 0) return <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>No quizzes available for this dialect yet.</div>;
  const quiz = quizzes[quizIndex];
  const totalScenes = quiz.cues.length;

  if (done) {
    return (
      <ResultsScreen
        title="Story Complete!"
        subtitle={quiz.title}
        score={score}
        total={totalScenes}
        dialectColor={dialect.color}
        actions={[
          {
            label: "Try Again", icon: <Repeat size={15} />, onClick: () => {
              setQuizIndex(0); setCueIndex(0); setSelectedAnswer(null); setShowResult(false); setScore(0); setDone(false);
            },
          },
          { label: "Try Fill in Blank", icon: <ArrowRight size={15} />, primary: true, onClick: () => onSwitchMode("completing-sentence") },
        ]}
      />
    );
  }

  const cue = quiz.cues[cueIndex];
  return (
    <div>
      {/* Header: score + progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#6B5B45" }}>
          <span style={{ fontWeight: 700, color: "#1A1208" }}>{quiz.title}</span>
        </div>
        <div style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: dialect.color }}>
          {score} / {totalScenes} ✓
        </div>
      </div>

      {/* Scene progress dots */}
      <div style={{ display: "flex", gap: 5, marginBottom: 24, alignItems: "center" }}>
        {quiz.cues.map((_, i) => (
          <div key={i} style={{
            flex: i === cueIndex ? 3 : 1,
            height: 8, borderRadius: 4,
            background: i < cueIndex ? dialect.color : i === cueIndex ? dialect.color : "#E8DDD0",
            opacity: i < cueIndex ? 0.45 : 1,
            transition: "all 0.35s ease"
          }} />
        ))}
      </div>

      {/* Scene badge + context */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${dialect.color}15`, border: `1.5px solid ${dialect.color}35`, borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: dialect.color, textTransform: "uppercase", letterSpacing: 1 }}>Scene {cueIndex + 1} of {totalScenes}</span>
        </div>
        <div style={{ background: "#F9F5EE", borderRadius: 14, padding: "18px 20px", border: `2px solid ${dialect.color}25`, position: "relative" }}>
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <ReportButton dialectId={dialectId} card={{ phrase: cue.context, meaning: quiz.title, staticSource: "storyQuizzes" }} gameMode="story-quiz"
              style={{ background: `${dialect.color}15`, border: `1px solid ${dialect.color}40`, color: dialect.color }} />
          </div>
          <div style={{ fontSize: 12, color: "#9B8B75", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}><MessageCircle size={13} /> WHAT WOULD YOU SAY?</div>
          <div style={{ fontSize: 15, color: "#1A1208", lineHeight: 1.6 }}>
            <AnnotatedText text={cue.context} dialectColor={dialect.color} />
          </div>
        </div>
      </div>

      {/* Result feedback banner */}
      {showResult && (
        <div style={{
          background: cue.dialogues[selectedAnswer]?.correct ? "#EAFAF1" : "#FDEDEC",
          border: `2px solid ${cue.dialogues[selectedAnswer]?.correct ? "#27AE60" : "#E74C3C"}`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 22 }}>{cue.dialogues[selectedAnswer]?.correct ? "✅" : "❌"}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: cue.dialogues[selectedAnswer]?.correct ? "#1A6B3C" : "#C0392B" }}>
              {cue.dialogues[selectedAnswer]?.correct ? "Correct!" : "Not quite."}
            </div>
            {!cue.dialogues[selectedAnswer]?.correct && (
              <div style={{ fontSize: 12, color: "#6B5B45", marginTop: 2 }}>
                Correct: <strong><DialectTooltip phrase={cue.dialogues.find(d => d.correct)?.phrase || ""} meaning={cue.dialogues.find(d => d.correct)?.meaning || ""} color={dialect.color} /></strong> — "{cue.dialogues.find(d => d.correct)?.meaning}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialogue options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {cue.dialogues.map((dialogue, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = dialogue.correct;
          let bg = "white", border = "#E8DDD0", color = "#1A1208", shadow = "none";
          if (!showResult && isSelected) { border = dialect.color; bg = `${dialect.color}12`; shadow = `0 2px 8px ${dialect.color}30`; }
          if (showResult) {
            if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
            else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
          }
          return (
            <button key={idx} className="btn-hover" onClick={() => !showResult && setSelectedAnswer(idx)}
              style={{ padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 14, cursor: showResult ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s", boxShadow: shadow }}>
              <div style={{ fontWeight: 700, marginBottom: 3 }}>
                <DialectTooltip phrase={dialogue.phrase} meaning={dialogue.meaning} color={dialect.color} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>"{dialogue.meaning}"</div>
              <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); speak(dialogue.phrase, dialectId); }}
                className="btn-tts"
                style={{ marginTop: 6, padding: "4px 12px", background: `${dialect.color}10`, border: `1px solid ${dialect.color}30`, borderRadius: 12, color: dialect.color, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Volume2 size={15} /> Hear
              </span>
              {showResult && isCorrect && <span style={{ float: "right", fontSize: 18, marginTop: -20 }}>✓</span>}
              {showResult && isSelected && !isCorrect && <span style={{ float: "right", fontSize: 18, marginTop: -20 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Action button */}
      {!showResult ? (
        <button className="btn-hover" onClick={() => {
          const correct = cue.dialogues[selectedAnswer]?.correct;
          if (correct) setScore(s => s + 1);
          setShowResult(true);
        }} disabled={selectedAnswer === null}
          style={{ width: "100%", padding: "14px", background: selectedAnswer !== null ? dialect.color : "#E8DDD0", color: selectedAnswer !== null ? "white" : "#9B8B75", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedAnswer !== null ? "pointer" : "default", fontFamily: "inherit" }}>
          Check Answer
        </button>
      ) : (
        <button className="btn-hover" onClick={() => {
          const isLastCue = cueIndex >= quiz.cues.length - 1;
          const isLastScenario = quizIndex >= quizzes.length - 1;
          if (!isLastCue) {
            setCueIndex(c => c + 1);
            setSelectedAnswer(null); setShowResult(false);
          } else if (!isLastScenario) {
            setQuizIndex(i => i + 1);
            setCueIndex(0); setSelectedAnswer(null); setShowResult(false);
          } else {
            setDone(true);
          }
        }}
          style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {cueIndex < quiz.cues.length - 1 ? <>Next Scene <ArrowRight size={15} /></> : quizIndex < quizzes.length - 1 ? <>Next Story <ArrowRight size={15} /></> : <>View Results <ArrowRight size={15} /></>}
        </button>
      )}
    </div>
  );
}
