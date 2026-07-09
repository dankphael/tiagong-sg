'use client';

import { useState } from "react";
import { FolderOpen, Search, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Mic } from "lucide-react";
import { singlishPhrases } from "@/data/staticData";

export default function SinglishPage() {
  const [disMode, setDisMode] = useState("cards"); // cards | search
  const [disSearch, setDisSearch] = useState("");
  const [disFilter, setDisFilter] = useState("All");
  const [disCard, setDisCard] = useState(0);
  const [disFlipped, setDisFlipped] = useState(false);
  const [disExpanded, setDisExpanded] = useState(null);

  const disCategories = ["All", "Feelings & Attitudes", "Character & Personality", "Exclamations", "Actions & Behaviours", "Culture & Mindset", "People & Relationships", "Work & Effort", "Food & Eating", "Reactions & Responses", "Expletives & Intensifiers"];
  const filtered = singlishPhrases.filter(p => {
    const catMatch = disFilter === "All" || p.category === disFilter;
    const searchMatch = disSearch === "" || p.phrase.toLowerCase().includes(disSearch.toLowerCase()) || p.meaning.toLowerCase().includes(disSearch.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(disSearch.toLowerCase()));
    return catMatch && searchMatch;
  });
  const cardPhrase = filtered[disCard] || filtered[0];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Singapore Heritage</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 48, color: "#1A1208", marginBottom: 8, lineHeight: 1.1 }}>
          Dialects<span style={{ color: "#C0392B", fontStyle: "italic" }}>In</span>Singlish
        </h1>
        <p style={{ color: "#8B7355", fontSize: 15, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
          The Singlish we speak every day — at the market, in NS, at the kopitiam — is woven through with dialect. Discover where your favourite phrases really come from.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="pill-toggle" style={{ maxWidth: 360, margin: "0 auto 36px" }}>
        {[["cards", FolderOpen, "Flashcards"],["search", Search, "Smart Search"]].map(([mode, Icon, label]) => (
          <button key={mode} className={disMode === mode ? "active" : ""} onClick={() => { setDisMode(mode); setDisCard(0); setDisFlipped(false); setDisExpanded(null); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* FLASHCARD MODE */}
      {disMode === "cards" && cardPhrase && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            {disCategories.map(c => (
              <button key={c} className="tab-btn" onClick={() => { setDisFilter(c); setDisCard(0); setDisFlipped(false); }}
                style={{ padding: "6px 14px", borderRadius: 20, background: disFilter === c ? "#C0392B" : "white", color: disFilter === c ? "white" : "#6B5B45", fontSize: 12, border: "1px solid " + (disFilter === c ? "#C0392B" : "#E8DDD0"), fontWeight: disFilter === c ? 600 : 400 }}>
                {c}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "#8B7355" }}>
            <span>{disFilter !== "All" ? disFilter : "All Categories"}</span>
            <span style={{ color: "#C0392B" }}>{disCard + 1} / {filtered.length}</span>
          </div>
          <div className="progress" style={{ marginBottom: 28 }}>
            <div className="progress-fill" style={{ width: filtered.length ? ((disCard + 1) / filtered.length * 100) + "%" : "0%", background: "#C0392B" }} />
          </div>

          {/* Flashcard */}
          <div className="card-3d" style={{ height: 320, marginBottom: 20, cursor: "pointer" }} onClick={() => setDisFlipped(!disFlipped)}>
            <div className={"card-inner" + (disFlipped ? " flipped" : "")} style={{ height: "100%", width: "100%" }}>
              {/* Front */}
              <div className="card-face" style={{ background: "linear-gradient(135deg, #1A1208 0%, #3D1F10 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 20 }}>Tap to reveal meaning</div>
                <div className="romanized" style={{ fontSize: 52, fontWeight: 700, color: "#F5E6C8", lineHeight: 1.1, marginBottom: 10 }}>{cardPhrase.phrase}</div>
                <div style={{ fontFamily: "var(--font-chinese)", fontSize: 22, color: "rgba(245,230,200,0.6)", marginBottom: 16 }}>{cardPhrase.chinese}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, background: cardPhrase.dialectColor + "40", color: cardPhrase.dialectColor, padding: "4px 12px", borderRadius: 12, fontWeight: 600 }}>{cardPhrase.dialect}</span>
                  <span style={{ fontSize: 12, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 12 }}>{cardPhrase.category}</span>
                </div>
              </div>
              {/* Back */}
              <div className="card-face card-back" style={{ background: "#FAF6F0", border: "3px solid #C0392B", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#C0392B", textTransform: "uppercase", marginBottom: 12 }}>Meaning</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "#1A1208", marginBottom: 14, lineHeight: 1.4 }}>{cardPhrase.meaning}</div>
                <div style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.7, marginBottom: 14 }}>{cardPhrase.fullExplanation}</div>
                <div style={{ fontSize: 12, color: "#C0392B", fontStyle: "italic", fontWeight: 600 }}>"{cardPhrase.examples[0]}"</div>
              </div>
            </div>
          </div>

          {/* Nav + Expand */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button className="btn-hover" onClick={() => { setDisFlipped(false); setTimeout(() => setDisCard(Math.max(0, disCard - 1)), 150); }} disabled={disCard === 0}
              style={{ flex: 1, padding: "13px", background: disCard === 0 ? "#E8DDD0" : "white", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 15, cursor: disCard === 0 ? "default" : "pointer", color: disCard === 0 ? "#C0B0A0" : "#1A1208" }}>
              <ArrowLeft size={15} /> Prev
            </button>
            <button className="btn-hover" onClick={() => setDisExpanded(disExpanded === cardPhrase.id ? null : cardPhrase.id)}
              style={{ padding: "13px 20px", background: "#F0E8DA", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 13, cursor: "pointer", color: "#6B5B45", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {disExpanded === cardPhrase.id ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Full Details</>}
            </button>
            <button className="btn-hover" onClick={() => { setDisFlipped(false); setTimeout(() => setDisCard(Math.min(filtered.length - 1, disCard + 1)), 150); }} disabled={disCard >= filtered.length - 1}
              style={{ flex: 1, padding: "13px", background: disCard >= filtered.length - 1 ? "#E8DDD0" : "#1A1208", color: disCard >= filtered.length - 1 ? "#C0B0A0" : "#F5E6C8", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: disCard >= filtered.length - 1 ? "default" : "pointer" }}>
              Next <ArrowRight size={15} />
            </button>
          </div>

          {/* Expanded Detail Panel */}
          {disExpanded === cardPhrase.id && (
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #F0E8DA", marginBottom: 24 }} className="fade-up">
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, background: cardPhrase.dialectColor + "18", color: cardPhrase.dialectColor, padding: "5px 14px", borderRadius: 20, fontWeight: 700 }}><Mic size={13} /> {cardPhrase.dialect}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, background: "#F0E8DA", color: "#6B5B45", padding: "5px 14px", borderRadius: 20 }}><FolderOpen size={13} /> {cardPhrase.category}</span>
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, color: "#1A1208", marginBottom: 8 }}>{cardPhrase.phrase} <span style={{ fontFamily: "var(--font-chinese)", fontSize: 18, color: "#9B8B75" }}>{cardPhrase.chinese}</span></div>
              <div style={{ fontSize: 15, color: "#C0392B", fontWeight: 600, marginBottom: 12 }}>{cardPhrase.meaning}</div>
              <div style={{ fontSize: 14, color: "#6B5B45", lineHeight: 1.8, marginBottom: 20 }}>{cardPhrase.fullExplanation}</div>
              <div style={{ fontSize: 13, color: "#8B7355", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Examples in use:</div>
              {cardPhrase.examples.map((ex, i) => (
                <div key={i} style={{ background: "#FAF6F0", borderRadius: 10, padding: "12px 16px", marginBottom: 8, fontSize: 14, color: "#1A1208", fontStyle: "italic", borderLeft: "3px solid #C0392B" }}>
                  "{ex}"
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
                {cardPhrase.tags.map(t => <span key={t} style={{ fontSize: 11, background: "#F5F0EA", color: "#9B8B75", padding: "4px 10px", borderRadius: 8 }}>#{t}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SMART SEARCH MODE */}
      {disMode === "search" && (
        <div>
          {/* Search Bar */}
          <div style={{ maxWidth: 600, margin: "0 auto 28px", position: "relative" }}>
            <input
              type="text"
              value={disSearch}
              onChange={e => { setDisSearch(e.target.value); setDisExpanded(null); }}
              placeholder="Search phrases, meanings, or contexts (e.g. 'NS', 'food', 'sian')..."
              style={{ width: "100%", padding: "16px 56px 16px 20px", borderRadius: 16, border: "2px solid " + (disSearch ? "#C0392B" : "#E8DDD0"), fontSize: 15, fontFamily: "inherit", background: "white", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", transition: "border 0.2s" }}
            />
            <Search size={20} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)" }} />
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            {disCategories.map(c => (
              <button key={c} className="tab-btn" onClick={() => { setDisFilter(c); setDisExpanded(null); }}
                style={{ padding: "6px 14px", borderRadius: 20, background: disFilter === c ? "#C0392B" : "white", color: disFilter === c ? "white" : "#6B5B45", fontSize: 12, border: "1px solid " + (disFilter === c ? "#C0392B" : "#E8DDD0"), fontWeight: disFilter === c ? 600 : 400 }}>
                {c}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div style={{ textAlign: "center", fontSize: 13, color: "#8B7355", marginBottom: 24 }}>
            {filtered.length === singlishPhrases.length ? `Showing all ${singlishPhrases.length} Singlish dialect phrases` : `Found ${filtered.length} phrase${filtered.length !== 1 ? "s" : ""}${disSearch ? " for \"" + disSearch + "\"" : ""}`}
          </div>

          {/* Results Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-text-faint)" }}><Search size={48} /></div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#1A1208", marginBottom: 8 }}>No phrases found</div>
              <div style={{ color: "#8B7355", fontSize: 14 }}>Try a different search or clear the filters</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {filtered.map(p => (
                <div key={p.id} style={{ background: "white", borderRadius: 18, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid " + (disExpanded === p.id ? "#C0392B" : "#F0E8DA"), cursor: "pointer", transition: "all 0.2s" }}
                  className="dialect-card" onClick={() => setDisExpanded(disExpanded === p.id ? null : p.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div className="romanized" style={{ fontSize: 26, fontWeight: 700, color: "#1A1208", lineHeight: 1 }}>{p.phrase}</div>
                      <div style={{ fontFamily: "var(--font-chinese)", fontSize: 14, color: "#9B8B75", marginTop: 2 }}>{p.chinese}</div>
                    </div>
                    <span style={{ fontSize: 11, background: p.dialectColor + "18", color: p.dialectColor, padding: "4px 10px", borderRadius: 10, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>{p.dialect}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#C0392B", fontWeight: 600, marginBottom: 8 }}>{p.meaning}</div>
                  {disExpanded !== p.id && (
                    <div style={{ fontSize: 13, color: "#8B7355", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.fullExplanation}</div>
                  )}
                  {disExpanded === p.id && (
                    <div className="fade-up">
                      <div style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.7, marginBottom: 16 }}>{p.fullExplanation}</div>
                      <div style={{ fontSize: 12, color: "#8B7355", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Examples:</div>
                      {p.examples.map((ex, i) => (
                        <div key={i} style={{ background: "#FAF6F0", borderRadius: 8, padding: "10px 14px", marginBottom: 6, fontSize: 13, color: "#1A1208", fontStyle: "italic", borderLeft: "3px solid " + p.dialectColor }}>
                          "{ex}"
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, background: "#F0E8DA", color: "#8B7355", padding: "3px 10px", borderRadius: 8 }}><FolderOpen size={11} /> {p.category}</span>
                        {p.tags.map(t => <span key={t} style={{ fontSize: 11, background: "#F5F0EA", color: "#9B8B75", padding: "3px 8px", borderRadius: 8 }}>#{t}</span>)}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-faint)", textAlign: "right", display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>{disExpanded === p.id ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> Expand</>}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Context banner at bottom */}
      <div style={{ marginTop: 56, background: "linear-gradient(135deg, #1A1208, #3D1F10)", borderRadius: 20, padding: "36px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--color-cream)" }}><Mic size={32} /></div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#F5E6C8", marginBottom: 8 }}>Singlish is dialect in disguise</div>
        <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
          From "bojio" to "jialat", the phrases that make Singlish uniquely ours are rooted in Hokkien, Cantonese, Teochew, Hakka and Hainanese. Every time you say "walao" or "paiseh", you're speaking dialect — and keeping it alive.
        </p>
      </div>
    </div>
  );
}
