'use client';

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/components/AppProvider";
import { speak } from "@/lib/tts";
import { ArrowLeft, ArrowRight, Repeat, Volume2 } from "lucide-react";
import { XP_REWARDS } from "@/data/xpSystem";
import { categories } from "@/data/staticData";
import { buildReverseCards } from "@/lib/gameDecks";
import { ResultsScreen } from "@/components/games/GameShared";

export default function ReverseCards({ dialect, dialectId, selectedCategory, onSelectCategory, autoStart, onSwitchMode }) {
  const { apiWords, awardXp } = useApp();
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState({});
  const [sessionKnownCount, setSessionKnownCount] = useState(0);
  const [done, setDone] = useState(null); // { score, total } | null
  const autoStarted = useRef(false);

  function restart(catId) {
    setCards(buildReverseCards(apiWords, dialectId, catId));
    setIndex(0);
    setFlipped(false);
    setKnown({});
    setSessionKnownCount(0);
    setDone(null);
  }

  useEffect(() => {
    if (autoStart && !autoStarted.current) {
      autoStarted.current = true;
      restart(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  if (done) {
    return (
      <ResultsScreen
        title="Reverse Cards Complete!"
        score={done.score}
        total={done.total}
        dialectColor={dialect.color}
        actions={[
          { label: "Try Again", icon: <Repeat size={15} />, onClick: () => restart(selectedCategory) },
          { label: "Back to Flashcards", icon: <ArrowRight size={15} />, primary: true, onClick: () => onSwitchMode("flashcards") },
        ]}
      />
    );
  }

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Repeat size={56} /></div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>Reverse Flashcards</h2>
        <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          See the English meaning — pick the correct {dialect.name} phrase. Harder mode!
        </p>
        <button className="btn-hover" onClick={() => restart(selectedCategory)}
          style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Start Reverse Cards <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#8B7355" }}>
        <span>Card {index + 1} of {cards.length}</span>
        <span style={{ color: dialect.color, fontWeight: 600 }}>{sessionKnownCount} known</span>
      </div>
      <div style={{ height: 4, background: "#E8DDD0", borderRadius: 2, marginBottom: 24 }}>
        <div style={{ width: `${((index + 1) / cards.length) * 100}%`, height: "100%", background: dialect.color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {categories.map(cat => (
          <button key={cat.id} className="tab-btn" onClick={() => { onSelectCategory(cat.id); restart(cat.id); }}
            style={{ flex: "0 0 auto", padding: "8px 12px", borderRadius: 12, background: selectedCategory === cat.id ? dialect.color : "white", color: selectedCategory === cat.id ? "white" : "#1A1208", fontSize: 12, fontWeight: 600, border: `2px solid ${selectedCategory === cat.id ? dialect.color : "#E8DDD0"}`, whiteSpace: "nowrap" }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24, cursor: "pointer" }}
        onClick={() => setFlipped(!flipped)}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>Tap to {flipped ? "see question" : "reveal answer"}</div>
        {!flipped ? (
          <>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "white" }}>{card.english}</div>
            {card.chinese && <div style={{ fontFamily: "var(--font-chinese)", fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{card.chinese}</div>}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Tap to reveal {dialect.name} phrase</div>
          </>
        ) : (
          <>
            <div className="romanized" style={{ fontSize: 36, fontWeight: 700, color: "white", padding: "0 24px" }}>{card.phrase}</div>
            <div style={{ fontFamily: "var(--font-chinese)", fontSize: 22, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{card.chinese}</div>
            {card.ipa && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8, fontStyle: "italic" }}>{card.ipa}</div>}
            {card.pos && <span style={{ fontSize: 10, background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 8, marginTop: 6, display: "inline-block" }}>{card.pos}</span>}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>Tap to go back</div>
            <button onClick={(e) => { e.stopPropagation(); speak(card.phrase, dialectId); }}
              className="btn-tts"
              style={{ marginTop: 10, padding: "8px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Volume2 size={15} /> Hear pronunciation
            </button>
          </>
        )}
      </div>

      {/* Know it / Still learning + nav */}
      {flipped ? (
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button className="btn-hover" onClick={() => {
            const key = `${dialectId}-reverse-${card.cardIndex}`;
            setKnown(prev => { const n = { ...prev }; delete n[key]; return n; });
            setFlipped(false);
            setTimeout(() => setIndex(c => Math.max(0, c - 1)), 150);
          }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
            <Repeat size={15} /> Review Again
          </button>
          <button className="btn-hover" onClick={() => {
            const key = `${dialectId}-reverse-${card.cardIndex}`;
            setKnown(prev => ({ ...prev, [key]: true }));
            setSessionKnownCount(c => c + 1);
            awardXp(XP_REWARDS.correctAnswer, 'correct');
            setFlipped(false);
            setTimeout(() => {
              if (index < cards.length - 1) {
                setIndex(c => c + 1);
              } else {
                setDone({ score: sessionKnownCount + 1, total: cards.length });
              }
            }, 150);
          }} style={{ flex: 2, padding: "13px", background: "#EAFAF1", border: "2px solid #27AE60", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#1A6B3C", cursor: "pointer", fontFamily: "inherit" }}>
            ✓ Know it!
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button className="btn-hover" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}
            style={{ flex: 1, padding: "13px", background: index === 0 ? "#F0EBE3" : "white", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 14, cursor: index === 0 ? "default" : "pointer", color: index === 0 ? "#C0B0A0" : "#1A1208", fontFamily: "inherit" }}>
            <ArrowLeft size={15} /> Prev
          </button>
          <button className="btn-hover" onClick={() => {
            if (index < cards.length - 1) {
              setIndex(i => i + 1);
            } else {
              setIndex(0);
            }
          }} style={{ flex: 2, padding: "13px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {index < cards.length - 1 ? <>Next <ArrowRight size={15} /></> : <><Repeat size={15} /> Restart</>}
          </button>
        </div>
      )}
    </div>
  );
}
