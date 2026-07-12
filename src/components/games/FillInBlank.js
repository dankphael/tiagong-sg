'use client';

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import { speak } from "@/lib/tts";
import { ArrowRight, Repeat, Volume2 } from "lucide-react";
import { buildSentenceExercises } from "@/lib/gameDecks";
import { ResultsScreen } from "@/components/games/GameShared";

export default function FillInBlank({ dialect, dialectId, onSwitchMode }) {
  const { apiWords } = useApp();
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Memoised on the dialect + dictionary size so it doesn't reshuffle each render.
  const exercises = useMemo(() => buildSentenceExercises(apiWords, dialectId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dialectId, apiWords.length]);

  // Keep the pointer in range if the exercise set changes.
  useEffect(() => {
    if (sentenceIndex > exercises.length - 1) { setSentenceIndex(0); setSelectedAnswer(null); setShowResult(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  if (exercises.length === 0) return <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>No exercises available yet.</div>;

  if (done) {
    return (
      <ResultsScreen
        title="All Done!"
        subtitle={`Fill in the Blank — ${dialect.name}`}
        score={score}
        total={exercises.length}
        dialectColor={dialect.color}
        actions={[
          {
            label: "Try Again", icon: <Repeat size={15} />, onClick: () => {
              setSentenceIndex(0); setSelectedAnswer(null); setShowResult(false); setScore(0); setDone(false);
            },
          },
          { label: "Back to Flashcards", primary: true, onClick: () => onSwitchMode("flashcards") },
        ]}
      />
    );
  }

  const exercise = exercises[sentenceIndex];
  const parts = exercise.sentence.split("___");
  const selectedWord = selectedAnswer !== null ? exercise.options[selectedAnswer] : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#6B5B45" }}>
          <span style={{ fontWeight: 700, color: "#1A1208" }}>Question {sentenceIndex + 1}</span> of {exercises.length}
        </div>
        <div style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: dialect.color }}>
          {score} / {exercises.length} ✓
        </div>
      </div>

      {/* Progress */}
      <div className="progress" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${((sentenceIndex + 1) / exercises.length) * 100}%`, background: dialect.color }} />
      </div>

      {/* Sentence card */}
      <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>Fill in the blank</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 700, color: "white", lineHeight: 1.8, flexWrap: "wrap" }}>
          {parts.map((part, idx) => (
            <span key={idx}>
              {part}
              {idx < parts.length - 1 && (
                <span style={{
                  display: "inline-block", minWidth: 60, padding: "2px 10px", margin: "0 6px",
                  background: showResult
                    ? (selectedAnswer === exercise.correctIndex ? "rgba(39,174,96,0.6)" : "rgba(231,76,60,0.6)")
                    : (selectedWord ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)"),
                  border: "2px dashed rgba(255,255,255,0.6)",
                  borderRadius: 8, textAlign: "center",
                  color: "white", transition: "all 0.2s"
                }}>
                  {selectedWord || "?"}
                </span>
              )}
            </span>
          ))}
        </div>
        {showResult && (
          <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
            "{exercise.meaning}"
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => speak(exercise.sentence.replace('___', exercise.options[exercise.correctIndex] || ''), dialectId)}
          style={{ padding: "8px 20px", background: "white", border: `2px solid ${dialect.color}40`, borderRadius: 20, color: dialect.color, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Volume2 size={15} /> Hear full sentence
        </button>
      </div>

      {/* Result feedback */}
      {showResult && (
        <div style={{
          background: selectedAnswer === exercise.correctIndex ? "#EAFAF1" : "#FDEDEC",
          border: `2px solid ${selectedAnswer === exercise.correctIndex ? "#27AE60" : "#E74C3C"}`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 22 }}>{selectedAnswer === exercise.correctIndex ? "✅" : "❌"}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: selectedAnswer === exercise.correctIndex ? "#1A6B3C" : "#C0392B" }}>
              {selectedAnswer === exercise.correctIndex ? "Correct!" : "Not quite."}
            </div>
            {selectedAnswer !== exercise.correctIndex && (
              <div style={{ fontSize: 12, color: "#6B5B45", marginTop: 2 }}>
                Answer: <strong>{exercise.options[exercise.correctIndex]}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="answer-grid" style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {exercise.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === exercise.correctIndex;
          let bg = "white", border = "#E8DDD0", color = "#1A1208", shadow = "none";
          if (!showResult && isSelected) { border = dialect.color; bg = `${dialect.color}12`; shadow = `0 2px 8px ${dialect.color}30`; }
          if (showResult) {
            if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
            else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
          }
          return (
            <button key={idx} className="btn-hover" onClick={() => !showResult && setSelectedAnswer(idx)}
              style={{ padding: "15px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: showResult ? "default" : "pointer", color, fontFamily: "inherit", transition: "all 0.2s", boxShadow: shadow, position: "relative" }}>
              {opt}
              {showResult && isCorrect && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✓</span>}
              {showResult && isSelected && !isCorrect && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Action button */}
      {!showResult ? (
        <button className="btn-hover" onClick={() => {
          const correct = selectedAnswer === exercise.correctIndex;
          if (correct) setScore(s => s + 1);
          setShowResult(true);
        }} disabled={selectedAnswer === null}
          style={{ width: "100%", padding: "14px", background: selectedAnswer !== null ? dialect.color : "#E8DDD0", color: selectedAnswer !== null ? "white" : "#9B8B75", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedAnswer !== null ? "pointer" : "default", fontFamily: "inherit" }}>
          Check Answer
        </button>
      ) : (
        <button className="btn-hover" onClick={() => {
          if (sentenceIndex < exercises.length - 1) {
            setSentenceIndex(i => i + 1);
            setSelectedAnswer(null); setShowResult(false);
          } else {
            setDone(true);
          }
        }}
          style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {sentenceIndex < exercises.length - 1 ? <>Next <ArrowRight size={15} /></> : <>View Results <ArrowRight size={15} /></>}
        </button>
      )}
    </div>
  );
}
