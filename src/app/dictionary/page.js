'use client';

import { useState, useEffect } from "react";
import {
  Search, X, ChevronUp, ChevronDown, Filter, ArrowLeft, ArrowRight,
  Users, Heart, Home, Smile, Plane, Clock, Utensils, Briefcase, MapPin,
  PawPrint, Coffee, Languages, BookOpen, User, CupSoda, Handshake, Hash,
  Waves, Car, Palette, Ruler, Flag, PersonStanding, Package, Sparkles,
  Repeat, MessageCircle, ScrollText, Mic,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { SealChip } from "@/components/ui";
import { dialects, lessons } from "@/data/staticData";
import ContributionModal from "@/components/ContributionModal";
import VariantChips from "@/components/VariantChips";
import Link from "next/link";

const CATEGORY_ICONS = {
  family: Users, body: Heart, daily_life: Home, emotions: Smile, travel: Plane,
  time: Clock, hawker: Utensils, hawker_culture: Utensils, profession: Briefcase,
  place: MapPin, animal: PawPrint, beverage: Coffee, language: Languages,
  other: BookOpen, person: User, drink: CupSoda, politeness: Handshake,
  food: Utensils, numbers: Hash, greetings: Waves, transport: Car, color: Palette,
  size: Ruler, singapore: Flag, verb: PersonStanding, noun: Package,
  adjective: Sparkles, adverb: Repeat, interjection: MessageCircle,
  by_pos: ScrollText,
};

const PAGE_SIZE = 60;

export default function DictionaryPage() {
  const { apiWords, overlay, currentUser, showToast } = useApp();
  const [contributionModal, setContributionModal] = useState(null); // { word, type } when composing
  const [canRecord, setCanRecord] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebouncedQuery, setSearchDebouncedQuery] = useState("");
  const [searchDialects, setSearchDialects] = useState(["hokkien", "cantonese", "teochew", "hakka", "hainanese"]);
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchSort, setSearchSort] = useState("relevance");

  useEffect(() => {
    const t = setTimeout(() => setSearchDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { setSearchPage(1); }, [searchDebouncedQuery, searchDialects, searchCategory, searchSort]);

  useEffect(() => {
    setCanRecord(!!(navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== "undefined"));
  }, []);

  // Build flat, searchable phrase database across all dialects
  const allPhrases = [];
  for (const [dialectId, dialectData] of Object.entries(lessons)) {
    const dialectInfo = dialects.find(d => d.id === dialectId);
    for (const [category, phrases] of Object.entries(dialectData)) {
      for (const p of phrases) {
        allPhrases.push({
          ...p,
          dialect: dialectId,
          dialectName: dialectInfo?.name || dialectId,
          dialectColor: dialectInfo?.color || "#666",
          dialectIcon: dialectInfo?.icon || "",
          category,
        });
      }
    }
  }
  for (const word of apiWords) {
    const dialectInfo = dialects.find(d => d.id === word.dialect);
    const cat = word.tags?.[0] || "other";
    allPhrases.push({
      wordId: word.id,
      phrase: word.headword?.romanized || "",
      chinese: word.headword?.traditional || "",
      meaning: word.definitions?.[0]?.english || "",
      romanisation: word.headword?.romanized || "",
      dialect: word.dialect,
      dialectName: dialectInfo?.name || word.dialect,
      dialectColor: dialectInfo?.color || "#666",
      dialectIcon: dialectInfo?.icon || "",
      category: cat,
      variants: overlay.variants[word.id] || [],
    });
  }
  for (const nw of overlay.newWords || []) {
    const dialectInfo = dialects.find(d => d.id === nw.dialect);
    allPhrases.push({
      wordId: null,
      phrase: nw.payload?.romanized || "",
      chinese: nw.payload?.traditional || "",
      meaning: nw.payload?.english || "",
      romanisation: nw.payload?.romanized || "",
      dialect: nw.dialect,
      dialectName: dialectInfo?.name || nw.dialect,
      dialectColor: dialectInfo?.color || "#666",
      dialectIcon: dialectInfo?.icon || "",
      category: nw.payload?.partOfSpeech || "other",
      variants: [],
      isCommunity: true,
      contributorName: nw.contributor_name,
    });
  }
  const q = searchDebouncedQuery.toLowerCase().trim();
  let filteredPhrases = allPhrases.filter(p => {
    if (!searchDialects.includes(p.dialect)) return false;
    if (searchCategory !== "all" && p.category !== searchCategory) return false;
    if (!q) return true;
    return (
      p.meaning.toLowerCase().includes(q) ||
      p.romanisation.toLowerCase().includes(q) ||
      p.chinese.includes(q) ||
      p.phrase.toLowerCase().includes(q)
    );
  });

  if (searchSort === "a-z") filteredPhrases.sort((a, b) => a.phrase.localeCompare(b.phrase));
  else if (searchSort === "z-a") filteredPhrases.sort((a, b) => b.phrase.localeCompare(a.phrase));

  const totalPages = Math.ceil(filteredPhrases.length / PAGE_SIZE);
  const start = (searchPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filteredPhrases.length);
  const pageResults = filteredPhrases.slice(start, end);

  function openContribution(word, type) {
    if (!currentUser) {
      showToast("Sign in to contribute", "error");
      return;
    }
    setContributionModal({ word, type });
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

      {/* Page header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="heading" style={{ fontSize: 38, marginBottom: 6 }}>
            Search All Dialects
          </h1>
          <p className="body-text" style={{ fontSize: 14 }}>
            Search across Hokkien, Cantonese, Teochew, Hakka and Hainanese simultaneously
          </p>
        </div>
        <Link href="/contribute?type=new_word" className="btn-hover"
          style={{ padding: "10px 18px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
          + Add a New Word
        </Link>
      </div>

      {contributionModal && (
        <ContributionModal word={contributionModal.word} type={contributionModal.type} onClose={() => setContributionModal(null)} />
      )}

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)", pointerEvents: "none" }} />
        <input
          className="search-input"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search meanings, romanisation, or Chinese characters in any dialect…"
          aria-label="Search all dialects"
          style={{ width: "100%", padding: "15px 48px", borderRadius: "var(--radius-md)", border: "2px solid var(--color-border)", fontSize: 15, fontFamily: "inherit", background: "var(--color-surface)", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setSearchDebouncedQuery(""); }}
            aria-label="Clear search"
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "var(--color-border)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {(searchDialects.length < 5 || searchCategory !== "all" || searchSort !== "relevance") && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "#8B7355", fontWeight: 600 }}>Active:</span>
          {searchDialects.length < 5 && searchDialects.map(id => {
            const info = dialects.find(d => d.id === id);
            return (
              <span key={id} style={{ background: `${info.color}18`, border: `1.5px solid ${info.color}55`, borderRadius: 20, padding: "3px 10px 3px 8px", fontSize: 12, color: info.color, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <SealChip dialect={info} size="sm" /> {info.name}
                <button onClick={() => setSearchDialects(prev => prev.filter(x => x !== id))}
                  aria-label={`Remove ${info.name} filter`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: info.color, fontSize: 14, padding: "0 0 0 2px", lineHeight: 1 }}>×</button>
              </span>
            );
          })}
          {searchCategory !== "all" && (
            <span style={{ background: "#F5EFE6", border: "1.5px solid #D4B896", borderRadius: 20, padding: "3px 10px 3px 10px", fontSize: 12, color: "#6B5B45", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              {searchCategory.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}
              <button onClick={() => setSearchCategory("all")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
            </span>
          )}
          {searchSort !== "relevance" && (
            <span style={{ background: "#F5EFE6", border: "1.5px solid #D4B896", borderRadius: 20, padding: "3px 10px 3px 10px", fontSize: 12, color: "#6B5B45", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              Sort: {searchSort === "a-z" ? "A – Z" : "Z – A"}
              <button onClick={() => setSearchSort("relevance")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
            </span>
          )}
          <button onClick={() => { setSearchDialects(["hokkien", "cantonese", "teochew", "hakka", "hainanese"]); setSearchCategory("all"); setSearchSort("relevance"); }}
            style={{ background: "none", border: "1.5px solid #E8DDD0", borderRadius: 20, padding: "3px 12px", fontSize: 12, color: "#8B7355", cursor: "pointer", fontFamily: "inherit" }}>
            Clear all
          </button>
        </div>
      )}

      {/* Mobile filter toggle */}
      <button onClick={() => setSearchFilterOpen(o => !o)}
        style={{ display: "none", width: "100%", padding: "12px", background: "white", border: "1.5px solid #E8DDD0", borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600, color: "#1A1208", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
        className="search-mobile-toggle">
        <><Filter size={16} /> Filters {searchFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</>
      </button>

      {/* Main layout: sidebar + results */}
      <div className="search-layout">

        {/* ── Filter sidebar ── */}
        <div className={`search-filter-panel${searchFilterOpen ? " open" : " search-filter-hidden"}`}
          style={{ background: "white", borderRadius: 16, padding: "20px", border: "1.5px solid #E8DDD0" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#1A1208", marginBottom: 18, letterSpacing: 1, textTransform: "uppercase" }}>Filters</div>

          {/* Dialect checkboxes */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Dialect</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button onClick={() => setSearchDialects(["hokkien", "cantonese", "teochew", "hakka", "hainanese"])}
                  style={{ fontSize: 11, color: "#C0392B", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>All</button>
                <span style={{ color: "#E8DDD0" }}>|</span>
                <button onClick={() => setSearchDialects([])}
                  style={{ fontSize: 11, color: "#8B7355", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>None</button>
              </div>
              {dialects.map(d => (
                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer", background: searchDialects.includes(d.id) ? `${d.color}0d` : "transparent", transition: "background 0.15s" }}>
                  <input
                    type="checkbox"
                    checked={searchDialects.includes(d.id)}
                    onChange={() => setSearchDialects(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                    aria-label={`Filter by ${d.name}`}
                    style={{ accentColor: d.color, width: 15, height: 15, cursor: "pointer" }}
                  />
                  <SealChip dialect={d} size="sm" />
                  <span style={{ fontSize: 13, color: "var(--color-text)", fontWeight: searchDialects.includes(d.id) ? 600 : 400 }}>{d.name}</span>
                  {!searchDialects.includes(d.id) && <span style={{ fontSize: 10, color: "#C0B0A0", marginLeft: "auto" }}>off</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Category</div>
            {(() => {
              const capitalize = s => s.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
              const apiCats = [...new Set(apiWords.map(w => w.tags?.[0] || "other"))].filter(c => !["greetings", "food", "numbers"].includes(c));
              const allSearchCats = [["all", "All categories"], ["greetings", "Greetings"], ["food", "Food & Drink"], ["numbers", "Numbers"], ...apiCats.map(c => [c, capitalize(c)])];
              return allSearchCats.map(([v, label]) => {
                const CatIcon = CATEGORY_ICONS[v] || Languages;
                return (
                  <button key={v} onClick={() => setSearchCategory(v)}
                    role="radio" aria-checked={searchCategory === v}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: searchCategory === v ? "var(--color-dark)" : "transparent", color: searchCategory === v ? "var(--color-cream)" : "var(--color-text-secondary)", border: searchCategory === v ? "none" : "1.5px solid transparent", fontSize: 13, fontWeight: searchCategory === v ? 700 : 400, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
                    {v !== "all" && <CatIcon size={15} />}
                    {label}
                  </button>
                );
              });
            })()}
          </div>

          {/* Sort */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B7355", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Sort By</div>
            {[["relevance", "Relevance"], ["a-z", "A – Z"], ["z-a", "Z – A"]].map(([v, label]) => (
              <button key={v} onClick={() => setSearchSort(v)}
                role="radio" aria-checked={searchSort === v}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: searchSort === v ? "#1A1208" : "transparent", color: searchSort === v ? "#F5E6C8" : "#6B5B45", border: searchSort === v ? "none" : "1.5px solid transparent", fontSize: 13, fontWeight: searchSort === v ? 700 : 400, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results ── */}
        <div>
          <div style={{ marginBottom: 14, fontSize: 13, color: "#8B7355", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              {filteredPhrases.length === 0
                ? "No results found"
                : <><strong style={{ color: "#1A1208" }}>{start + 1}–{end}</strong> of <strong style={{ color: "#1A1208" }}>{filteredPhrases.length}</strong> phrase{filteredPhrases.length !== 1 ? "s" : ""}</>
              }
              {q && <> for "<em>{q}</em>"</>}
            </span>
            {filteredPhrases.length > 0 && !q && searchCategory === "all" && searchDialects.length === 5 && (
              <span style={{ fontSize: 12, color: "#C0B0A0" }}>Showing all · use search or filters to narrow</span>
            )}
          </div>

          {filteredPhrases.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-text-faint)" }}><Search size={48} /></div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 8 }}>No matches found</div>
              <p style={{ color: "#6B5B45", fontSize: 14, marginBottom: 20 }}>
                Try a different word or broaden your dialect and category filters.
              </p>
              <div style={{ fontSize: 13, color: "#8B7355" }}>
                Try: <em>"rice"</em>, <em>"hello"</em>, <em>"thank you"</em>, <em>"morning"</em>, <em>"eat"</em>
              </div>
              {searchDialects.length === 0 && (
                <div style={{ marginTop: 16, fontSize: 13, color: "#C0392B", fontWeight: 600 }}>
                   No dialects selected — check at least one dialect in the filter panel.
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="search-results-grid">
                {pageResults.map((p, i) => (
                  <div key={start + i} className="result-card btn-hover"
                    style={{ background: "white", borderRadius: 14, padding: "16px", border: "1.5px solid #E8DDD0", cursor: "default", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ background: `${p.dialectColor}16`, border: `1.5px solid ${p.dialectColor}50`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: p.dialectColor, fontWeight: 700, letterSpacing: 0.3 }}>
                        {p.dialectName}
                      </span>
                      <span style={{ background: "#F5EFE6", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#8B7355" }}>
                        {p.category}
                      </span>
                      {p.isCommunity && (
                        <span style={{ background: "#EAFAF1", border: "1.5px solid #1A6B3C50", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 700 }}>
                          Community
                        </span>
                      )}
                    </div>
                    <div className="romanized" style={{ fontSize: 22, fontWeight: 700, color: "#1A1208", marginBottom: 2 }}>
                      {p.phrase}
                    </div>
                    <div style={{ fontFamily: "var(--font-chinese)", fontSize: 15, color: "#8B7355", marginBottom: 6 }}>
                      {p.chinese}
                    </div>
                    <div style={{ fontSize: 13, color: "#1A6B3C", fontWeight: 600, marginBottom: 3 }}>
                      {p.meaning}
                    </div>
                    <div style={{ fontSize: 12, color: "#9B8B75", fontStyle: "italic", marginBottom: (p.wordId || p.isCommunity) ? 10 : 0 }}>
                      /{p.romanisation}/
                    </div>
                    {p.isCommunity && p.contributorName && (
                      <div style={{ fontSize: 11, color: "#9B8B75", marginBottom: 10 }}>Contributed by {p.contributorName}</div>
                    )}
                    <VariantChips variants={p.variants} />
                    {p.wordId && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, borderTop: "1px solid #F0E8DA", paddingTop: 4, marginLeft: -8 }}>
                        <button onClick={() => openContribution(p, "correction")}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit" }}>
                          Suggest an edit
                        </button>
                        <button onClick={() => openContribution(p, "usage_example")}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit" }}>
                          Add example
                        </button>
                        {canRecord && (
                          <button onClick={() => openContribution(p, "pronunciation_audio")}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Mic size={11} /> Record pronunciation
                          </button>
                        )}
                        <button onClick={() => openContribution(p, "error_flag")}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C0392B", fontWeight: 600, padding: "8px", fontFamily: "inherit" }}>
                          Flag issue
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
                  <button onClick={() => { setSearchPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={searchPage === 1}
                    style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #E8DDD0", background: searchPage === 1 ? "#F5EFE6" : "white", color: searchPage === 1 ? "#C0B0A0" : "#1A1208", fontWeight: 600, fontSize: 13, cursor: searchPage === 1 ? "default" : "pointer", fontFamily: "inherit" }}>
                    <ArrowLeft size={15} /> Previous
                  </button>
                  <span style={{ fontSize: 13, color: "#6B5B45" }}>
                    Page <strong>{searchPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <button onClick={() => { setSearchPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={searchPage === totalPages}
                    style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #E8DDD0", background: searchPage === totalPages ? "#F5EFE6" : "white", color: searchPage === totalPages ? "#C0B0A0" : "#1A1208", fontWeight: 600, fontSize: 13, cursor: searchPage === totalPages ? "default" : "pointer", fontFamily: "inherit" }}>
                    Next <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
