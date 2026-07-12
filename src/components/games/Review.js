'use client';

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/components/AppProvider";
import { speak } from "@/lib/tts";
import { Star, Repeat, Volume2 } from "lucide-react";
import { XP_REWARDS } from "@/data/xpSystem";
import { buildReviewQueue } from "@/lib/gameDecks";

export default function Review({ dialect, dialectId, autoStart }) {
  const { apiWords, knownCards, setKnownCards, awardXp } = useApp();
  const [queue, setQueue] = useState([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [started, setStarted] = useState(false);
  const hasInteractedRef = useRef(false);
  const autoStarted = useRef(false);

  function startReview() {
    setQueue(buildReviewQueue(apiWords, dialectId, knownCards));
    setPos(0);
    setFlipped(false);
    setStarted(true);
    hasInteractedRef.current = false;
  }

  useEffect(() => {
    if (autoStart && !autoStarted.current) {
      autoStarted.current = true;
      startReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // If the dictionary finishes loading after the queue was already built,
  // rebuild once — but only before the user has interacted, so we never yank
  // cards out from under an in-progress review session.
  useEffect(() => {
    if (started && !hasInteractedRef.current) {
      setQueue(buildReviewQueue(apiWords, dialectId, knownCards));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiWords.length]);

  if (queue.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Star size={56} /></div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>All caught up!</h2>
        <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          You've marked every card in this dialect as known. Keep learning new categories in Flashcards to build up more review material.
        </p>
        <button className="btn-hover" onClick={startReview}
          style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {started ? "Refresh" : "Start Review"} <Repeat size={15} />
        </button>
      </div>
    );
  }

  const item = queue[pos];
  const card = item.card;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#8B7355" }}>
        <span>Card {pos + 1} of {queue.length}</span>
        <span style={{ color: dialect.color, fontWeight: 600 }}>{item.category.replace(/_/g, ' ')}</span>
      </div>
      <div className="progress" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${((pos + 1) / queue.length) * 100}%`, background: dialect.color }} />
      </div>

      <div className="card-3d flashcard" style={{ marginBottom: 20 }} onClick={() => setFlipped(!flipped)}>
        <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
          <div className="card-face" style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 14 }}>Tap to reveal meaning</div>
            <div className="romanized" style={{ fontSize: "clamp(28px, 9vw, 44px)", fontWeight: 700, color: "white", textAlign: "center", padding: "0 24px" }}>{card.phrase}</div>
            <div style={{ fontFamily: "var(--font-chinese)", fontSize: 26, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>{card.chinese}</div>
            <button onClick={(e) => { e.stopPropagation(); speak(card.phrase, dialectId); }}
              className="btn-tts"
              style={{ marginTop: 16, padding: "8px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-pill)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <Volume2 size={15} /> Hear it
            </button>
          </div>
          <div className="card-face card-back" style={{ background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: `3px solid ${dialect.color}`, borderRadius: 20, padding: "24px 20px" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "#1A1208", textAlign: "center", padding: "0 12px" }}>{card.meaning}</div>
            <div style={{ fontSize: 14, color: dialect.color, marginTop: 8, fontWeight: 600 }}>{card.romanisation}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <button className="btn-hover" onClick={() => {
          hasInteractedRef.current = true;
          setFlipped(false);
          setTimeout(() => setPos(p => (p + 1) % queue.length), 150);
        }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
          <Repeat size={15} /> Still learning
        </button>
        <button className="btn-hover" onClick={() => {
          hasInteractedRef.current = true;
          setKnownCards(prev => ({ ...prev, [item.key]: true }));
          awardXp(XP_REWARDS.correctAnswer, 'reviewed');
          setFlipped(false);
          setTimeout(() => {
            const nextQueue = queue.filter((_, i) => i !== pos);
            setQueue(nextQueue);
            setPos(p => nextQueue.length ? p % nextQueue.length : 0);
          }, 150);
        }} style={{ flex: 2, padding: "13px", background: "#EAFAF1", border: "2px solid #27AE60", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#1A6B3C", cursor: "pointer", fontFamily: "inherit" }}>
          ✓ Know it!
        </button>
      </div>
    </div>
  );
}
