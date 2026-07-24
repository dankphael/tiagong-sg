'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Volume2, Mic, Bookmark, Share2 } from "lucide-react";
import { speak } from "@/lib/tts";
import { useApp } from "@/components/AppProvider";
import VariantChips from "@/components/VariantChips";
import WordComments from "@/components/WordComments";

const FREQUENCY_LABELS = { very_common: "Very common", common: "Common", uncommon: "Uncommon", rare: "Rare" };
const REPORT_STATUS_COLORS = { pending: "#D4860B", accepted: "#1A6B3C", rejected: "#C0392B" };

// Full detail view for a dictionary word — opened by tapping a result card.
// `word` is the flattened card object (always present — every card, DB-backed
// or not, carries a stable `wordId`, see src/lib/wordId.js); `fullWord` is the
// raw dictionary.json entry when this word is DB-backed (null otherwise),
// which unlocks multiple definitions, example sentences, pronunciations,
// etymology, and synonyms.
export default function WordDetailModal({ word, fullWord, onClose, onContribute, canRecord, commentCount, isSaved, onToggleSave, reportStatus }) {
  const { showToast } = useApp();

  function handleShare() {
    const url = `${window.location.origin}/dictionary?word=${encodeURIComponent(word.wordId)}`;
    navigator.clipboard.writeText(url)
      .then(() => showToast("Link copied", "success"))
      .catch(() => showToast("Couldn't copy link", "error"));
  }
  // Rendered via a portal straight into document.body: the page content
  // wrapper uses the site-wide .fade-up entrance animation, which ends at
  // (but keeps, via animation-fill-mode) transform: translateY(0) — any
  // non-"none" transform on an ancestor creates a new containing block for
  // position:fixed descendants, which would otherwise size/position this
  // backdrop against the page container instead of the real viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKeyDown(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!word || !mounted) return null;

  const definitions = fullWord?.definitions?.length > 0 ? fullWord.definitions : null;
  const pronunciations = fullWord?.pronunciations || [];
  const synonyms = fullWord?.synonyms || [];
  const relatedWords = fullWord?.related_words || [];

  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px, 4vw, 24px)" }}
      onClick={onClose}>
      <div style={{ background: "white", borderRadius: 20, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "clamp(20px, 5vw, 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.25)", position: "relative" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 6 }}>
          <button onClick={onToggleSave} aria-label={isSaved ? "Remove from saved" : "Save this entry"}
            style={{ background: "#F5F0EA", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isSaved ? "#1A6B3C" : "#6B5B45" }}>
            <Bookmark size={15} fill={isSaved ? "#1A6B3C" : "none"} />
          </button>
          <button onClick={handleShare} aria-label="Copy link to this entry"
            style={{ background: "#F5F0EA", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B5B45" }}>
            <Share2 size={15} />
          </button>
          <button onClick={onClose} aria-label="Close"
            style={{ background: "#F5F0EA", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B5B45" }}>
            <X size={16} />
          </button>
        </div>

        {/* Header */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", paddingRight: 116 }}>
          <span style={{ background: `${word.dialectColor}16`, border: `1.5px solid ${word.dialectColor}50`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: word.dialectColor, fontWeight: 700, letterSpacing: 0.3 }}>
            {word.dialectName}
          </span>
          <span style={{ background: "#F5EFE6", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#8B7355" }}>{word.category}</span>
          {word.isCommunity && (
            <span style={{ background: "#EAFAF1", border: "1.5px solid #1A6B3C50", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 700 }}>Community</span>
          )}
        </div>

        <div className="romanized" style={{ fontSize: 32, fontWeight: 700, color: "#1A1208", marginBottom: 4 }}>{word.phrase}</div>
        <div style={{ fontFamily: "var(--font-chinese)", fontSize: 20, color: "#8B7355", marginBottom: 8 }}>{word.chinese}</div>
        <div style={{ fontSize: 16, color: "#1A6B3C", fontWeight: 600, marginBottom: 4 }}>{word.meaning}</div>
        <div style={{ fontSize: 13, color: "#9B8B75", fontStyle: "italic", marginBottom: 12 }}>/{word.romanisation}/</div>

        {(fullWord?.part_of_speech || fullWord?.frequency || fullWord?.register) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {fullWord?.part_of_speech && <span className="chip">{fullWord.part_of_speech}</span>}
            {fullWord?.frequency && <span className="chip">{FREQUENCY_LABELS[fullWord.frequency] || fullWord.frequency}</span>}
            {fullWord?.register && <span className="chip">{fullWord.register}</span>}
          </div>
        )}

        {word.isCommunity && word.contributorName && (
          <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 16 }}>Contributed by {word.contributorName}</div>
        )}

        {reportStatus && (
          <div style={{ fontSize: 12, color: REPORT_STATUS_COLORS[reportStatus.status] || "#D4860B", fontWeight: 600, marginBottom: 16 }}>
            You reported this — {reportStatus.status}
            {reportStatus.status === "rejected" && reportStatus.reviewNote && (
              <span style={{ display: "block", fontStyle: "italic", fontWeight: 400, marginTop: 2 }}>Custodian note: {reportStatus.reviewNote}</span>
            )}
          </div>
        )}

        {/* Hear it */}
        <button onClick={() => speak(word.phrase, word.dialect)}
          style={{ marginBottom: 16, padding: "10px 20px", background: `${word.dialectColor}12`, border: `1px solid ${word.dialectColor}40`, borderRadius: "var(--radius-pill)", color: word.dialectColor, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Volume2 size={15} /> Hear it
        </button>

        {pronunciations.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Pronunciation</div>
            {pronunciations.map((pr, i) => (
              <div key={i} style={{ fontSize: 13, color: "#6B5B45", marginBottom: 2 }}>
                <span style={{ textTransform: "capitalize" }}>{pr.type}</span>
                {pr.romanization_system && <> · {pr.romanization_system.toUpperCase()}</>}
                {pr.romanization && <> {pr.romanization}</>}
                {pr.ipa && <span style={{ color: "#9B8B75", fontStyle: "italic" }}> {pr.ipa}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Definitions + examples */}
        {definitions && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              {definitions.length > 1 ? "Definitions" : "Definition"}
            </div>
            {definitions.map((def, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, color: "#1A1208", fontWeight: 600 }}>
                  {definitions.length > 1 && <span style={{ color: "#9B8B75", fontWeight: 400 }}>{def.order || i + 1}. </span>}
                  {def.english}
                </div>
                {def.mandarin && <div style={{ fontSize: 13, color: "#8B7355", fontFamily: "var(--font-chinese)", marginTop: 2 }}>{def.mandarin}</div>}
                {def.notes && <div style={{ fontSize: 12, color: "#8B7355", fontStyle: "italic", marginTop: 4 }}>{def.notes}</div>}
                {(def.examples || []).map((ex, j) => (
                  <div key={j} style={{ background: "#FAF6F0", borderRadius: 8, padding: "8px 12px", marginTop: 6, fontSize: 12, borderLeft: `3px solid ${word.dialectColor}` }}>
                    <div style={{ fontStyle: "italic", color: "#1A1208" }}>"{ex.text_source_lang}"</div>
                    <div style={{ color: "#8B7355", marginTop: 2 }}>{ex.text_target_lang}</div>
                    {(ex.context || ex.formality) && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {ex.context && <span className="chip" style={{ fontSize: 10 }}>{ex.context}</span>}
                        {ex.formality && <span className="chip" style={{ fontSize: 10 }}>{ex.formality}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {fullWord?.etymology && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Etymology</div>
            <div style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.6 }}>{fullWord.etymology}</div>
          </div>
        )}

        {fullWord?.notes && (
          <div style={{ marginBottom: 16, fontSize: 12, color: "#8B7355", fontStyle: "italic" }}>{fullWord.notes}</div>
        )}

        {(synonyms.length > 0 || relatedWords.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            {synonyms.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Synonyms</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {synonyms.map((s, i) => <span key={i} className="chip">{s}</span>)}
                </div>
              </div>
            )}
            {relatedWords.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Related words</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {relatedWords.map((r, i) => <span key={i} className="chip">{r}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        <VariantChips variants={word.variants} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, borderTop: "1px solid #F0E8DA", marginTop: 12, paddingTop: 8, marginLeft: -8 }}>
          <button onClick={() => onContribute(word, "correction")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit" }}>
            Suggest an edit
          </button>
          <button onClick={() => onContribute(word, "usage_example")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit" }}>
            Add example
          </button>
          {canRecord && (
            <button onClick={() => onContribute(word, "pronunciation_audio")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Mic size={12} /> Record pronunciation
            </button>
          )}
          <button onClick={() => onContribute(word, "error_flag")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#C0392B", fontWeight: 600, padding: "8px", fontFamily: "inherit" }}>
            Flag issue
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <WordComments wordId={word.wordId} dialect={word.dialect} count={commentCount || 0} />
        </div>
      </div>
    </div>,
    document.body
  );
}
