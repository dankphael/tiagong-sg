'use client';

import { useState, useEffect } from "react";
import { useApp } from "@/components/AppProvider";
import { speak } from "@/lib/tts";
import { ArrowLeft, ArrowRight, Repeat, Volume2, Languages } from "lucide-react";
import { lessons, categories } from "@/data/staticData";
import { buildCardsForCategory } from "@/lib/gameDecks";
import { CATEGORY_ICONS } from "@/components/games/GameShared";

export default function Flashcards({ dialect, dialectId, selectedCategory, onSelectCategory, onSwitchMode }) {
  const { apiWords, knownCards, setKnownCards, progress, setProgress } = useApp();
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = buildCardsForCategory(apiWords, dialectId, selectedCategory);

  // Keep cardIndex in range: the deck can shrink after dictionary words load
  // in, or when switching categories, which would otherwise leave cardIndex
  // pointing past the end and render a blank card.
  useEffect(() => {
    if (cardIndex > cards.length - 1) setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const safeCardIndex = cards.length > 0 ? Math.min(cardIndex, cards.length - 1) : 0;
  const currentCard = cards[safeCardIndex];

  function nextCard() {
    setFlipped(false);
    setTimeout(() => {
      if (cardIndex < cards.length - 1) setCardIndex(cardIndex + 1);
      else {
        const key = `${dialectId}-${selectedCategory}`;
        setProgress(p => ({ ...p, [key]: true }));
        setCardIndex(0);
      }
    }, 150);
  }

  function prevCard() {
    setFlipped(false);
    setTimeout(() => setCardIndex(Math.max(0, cardIndex - 1)), 150);
  }

  return (
    <div>
      {/* Category tabs — includes dictionary tags + part_of_speech */}
      {(() => {
        const capitalize = s => s.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        const dictTags = dialectId ? [...new Set(apiWords.filter(w => w.dialect === dialectId).flatMap(w => w.tags || []))] : [];
        const staticCats = categories.map(c => c.id);
        const dictOnlyTags = dictTags.filter(t => !staticCats.includes(t)).map(t => ({ id: t, label: capitalize(t) }));
        const allCats = [...categories, ...dictOnlyTags];

        const getCardCount = (catId) => {
          const staticCount = lessons[dialectId]?.[catId]?.length || 0;
          const dictCount = apiWords.filter(w => w.dialect === dialectId && (w.tags || []).includes(catId)).length;
          return staticCount + dictCount;
        };

        return (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {allCats.map(cat => {
              const key = `${dialectId}-${cat.id}`;
              const done = progress[key];
              const knownCount = Object.keys(knownCards).filter(k => k.startsWith(`${dialectId}-${cat.id}-`)).length;
              const total = getCardCount(cat.id);
              const CatIcon = CATEGORY_ICONS[cat.id] || Languages;
              return (
                <button key={cat.id} className="tab-btn" onClick={() => { onSelectCategory(cat.id); setCardIndex(0); setFlipped(false); }}
                  style={{ flex: "0 0 auto", padding: "10px 12px", borderRadius: "var(--radius-md)", background: selectedCategory === cat.id ? dialect.color : "var(--color-surface)", color: selectedCategory === cat.id ? "white" : "var(--color-text)", fontSize: 12, fontWeight: 600, border: `2px solid ${selectedCategory === cat.id ? dialect.color : "var(--color-border)"}`, whiteSpace: "nowrap", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><CatIcon size={14} /> {cat.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{knownCount}/{total} known {done ? "✓" : ""}</div>
                </button>
              );
            })}
          </div>
        );
      })()}

      {cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#8B7355", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
          No cards in this category yet. Pick another category above, or contribute words to help grow it.
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "#8B7355" }}>
            <span>Card {safeCardIndex + 1} / {cards.length}</span>
            <span style={{ color: dialect.color, fontWeight: 600 }}>
              {Object.keys(knownCards).filter(k => k.startsWith(`${dialectId}-${selectedCategory}-`)).length} known
            </span>
          </div>
          <div className="progress" style={{ marginBottom: 24 }}>
            <div className="progress-fill" style={{ width: `${((safeCardIndex + 1) / cards.length) * 100}%`, background: dialect.color }} />
          </div>

          {/* Flashcard */}
          <div className="card-3d flashcard" style={{ marginBottom: 20 }} onClick={() => setFlipped(!flipped)}>
            <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
              <div className="card-face" style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 14 }}>Tap to reveal meaning</div>
                <div className="romanized" style={{ fontSize: 44, fontWeight: 700, color: "white", textAlign: "center", padding: "0 24px" }}>
                  {currentCard?.phrase}
                </div>
                <div style={{ fontFamily: "var(--font-chinese)", fontSize: 26, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
                  {currentCard?.chinese}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, fontStyle: "italic" }}>
                  /{currentCard?.romanisation}/
                </div>
                <button onClick={(e) => { e.stopPropagation(); speak(currentCard?.phrase, dialectId); }}
                  className="btn-tts"
                  style={{ marginTop: 16, padding: "8px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-pill)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <Volume2 size={15} /> Hear it
                </button>
              </div>
              <div className="card-face card-back" style={{ background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", cursor: "pointer", border: `3px solid ${dialect.color}`, borderRadius: 20, padding: "24px 20px", overflowY: "auto" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#9B8B75", textTransform: "uppercase", marginBottom: 10 }}>Meaning</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "#1A1208", textAlign: "center", padding: "0 12px" }}>
                  {currentCard?.meaning}
                </div>
                <div style={{ fontSize: 14, color: dialect.color, marginTop: 8, fontWeight: 600 }}>
                  {currentCard?.romanisation}
                </div>
                <div style={{ fontFamily: "var(--font-chinese)", fontSize: 18, color: "#8B7355", marginTop: 4 }}>
                  {currentCard?.chinese}
                </div>
                {currentCard?.ipa && (
                  <div style={{ fontSize: 13, color: "#9B8B75", marginTop: 8, fontStyle: "italic" }}>
                    {currentCard?.ipa}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                  {currentCard?.pos && (
                    <span style={{ fontSize: 10, background: "#F0E8DA", color: "#8B7355", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>{currentCard?.pos}</span>
                  )}
                  {currentCard?.frequency && (
                    <span style={{ fontSize: 10, background: currentCard?.frequency === 'very_common' ? "#EAFAF1" : "#FEF9E7", color: currentCard?.frequency === 'very_common' ? "#1A6B3C" : "#D4860B", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>{currentCard?.frequency}</span>
                  )}
                </div>
                {currentCard?.examples && currentCard?.examples.length > 0 && (
                  <div style={{ marginTop: 10, width: "100%" }}>
                    <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Example</div>
                    {currentCard.examples.slice(0, 2).map((ex, i) => (
                      <div key={i} style={{ background: "#FAF6F0", borderRadius: 8, padding: "8px 12px", marginBottom: 4, fontSize: 12, color: "#1A1208", borderLeft: `3px solid ${dialect.color}` }}>
                        <div style={{ fontStyle: "italic" }}>"{ex.text_source_lang}"</div>
                        <div style={{ color: "#8B7355", marginTop: 2 }}>{ex.text_target_lang}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); speak(currentCard?.phrase, dialectId); }}
                  className="btn-tts"
                  style={{ marginTop: 12, padding: "8px 20px", background: `${dialect.color}15`, border: `1px solid ${dialect.color}40`, borderRadius: "var(--radius-pill)", color: dialect.color, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <Volume2 size={15} /> Hear pronunciation
                </button>
              </div>
            </div>
          </div>

          {/* Know it / Still learning + nav */}
          {flipped ? (
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button className="btn-hover" onClick={() => {
                const key = `${dialectId}-${selectedCategory}-${currentCard?.phrase}`;
                setKnownCards(prev => { const n = { ...prev }; delete n[key]; return n; });
                setFlipped(false);
                setTimeout(() => setCardIndex(c => Math.max(0, c - 1)), 150);
              }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
                <Repeat size={15} /> Review Again
              </button>
              <button className="btn-hover" onClick={() => {
                const key = `${dialectId}-${selectedCategory}-${currentCard?.phrase}`;
                setKnownCards(prev => ({ ...prev, [key]: true }));
                setFlipped(false);
                setTimeout(() => {
                  if (cardIndex < cards.length - 1) {
                    setCardIndex(c => c + 1);
                  } else {
                    setProgress(p => ({ ...p, [`${dialectId}-${selectedCategory}`]: true }));
                    setCardIndex(0);
                  }
                }, 150);
              }} style={{ flex: 2, padding: "13px", background: "#EAFAF1", border: "2px solid #27AE60", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#1A6B3C", cursor: "pointer", fontFamily: "inherit" }}>
                ✓ Know it!
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button className="btn-hover" onClick={prevCard} disabled={cardIndex === 0}
                style={{ flex: 1, padding: "13px", background: cardIndex === 0 ? "#F0EBE3" : "white", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 14, cursor: cardIndex === 0 ? "default" : "pointer", color: cardIndex === 0 ? "#C0B0A0" : "#1A1208", fontFamily: "inherit" }}>
                <ArrowLeft size={15} /> Prev
              </button>
              <button className="btn-hover" onClick={nextCard}
                style={{ flex: 2, padding: "13px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {cardIndex < cards.length - 1 ? <>Next <ArrowRight size={15} /></> : <><Repeat size={15} /> Restart</>}
              </button>
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{ background: "#1A1208", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ color: "#F5E6C8", fontSize: 15, fontFamily: "var(--font-serif)" }}>Ready for a challenge?</div>
              <div style={{ color: "#6B5B45", fontSize: 12, marginTop: 2 }}>Test yourself with story scenarios</div>
            </div>
            <button className="btn-hover" onClick={() => onSwitchMode("situational-quiz")}
              style={{ background: dialect.color, color: "white", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>
              Try Story Quiz <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
