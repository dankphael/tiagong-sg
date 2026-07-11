'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { hokkienFlashcards } from "@/data/flashcardsHokkien";
import { cantoneseFlashcards } from "@/data/flashcardsCantonese";
import { teochewFlashcards } from "@/data/flashcardsTeochew";
import { hakkaFlashcards } from "@/data/flashcardsHakka";
import { hainaneseFlashcards } from "@/data/flashcardsHainanese";
import { speak } from "@/lib/tts";
import { XP_REWARDS, getLevel, getNextLevel, getLevelProgress, seededRandom, getDailyChallengeSeed } from "@/data/xpSystem";
import { AnnotatedText, DialectTooltip, SealChip } from "@/components/ui";
import {
  ArrowLeft, ArrowRight, BookOpen, Clapperboard, PenLine, Zap, Trophy, Repeat,
  Volume2, MessageCircle, Languages, Users, Heart, Home, Smile, Plane, Clock,
  Utensils, Briefcase, MapPin, PawPrint, Coffee, User, CupSoda, Handshake,
  Hash, Waves, Car, Palette, Ruler, Flag, PersonStanding, Package, Sparkles,
  ScrollText, Flame, Star,
} from "lucide-react";
import { dialects, lessons, categories, situationalQuizzes, sentenceCompletion } from "@/data/staticData";

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

export default function LearnDialectPage() {
  const params = useParams();
  const router = useRouter();
  const dialectId = params.dialect;
  const dialect = dialects.find(d => d.id === dialectId);

  const {
    currentUser, xp, streak, setStreak, knownCards, setKnownCards,
    progress, setProgress, apiWords, awardXp,
    markDailyComplete, setSelectedDialect,
  } = useApp();

  const selectedDialect = dialectId;

  useEffect(() => {
    if (dialect) setSelectedDialect(dialect.id);
  }, [dialect]);

  const [lessonMode, setLessonMode] = useState("flashcards");
  const [selectedCategory, setSelectedCategory] = useState("greetings");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [situationalQuizIndex, setSituationalQuizIndex] = useState(0);
  const [situationalCueIndex, setSituationalCueIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [situationalScore, setSituationalScore] = useState(0);
  const [sentenceScore, setSentenceScore] = useState(0);
  const [completionData, setCompletionData] = useState(null);

  // Speed Round mode
  const [speedTimeLeft, setSpeedTimeLeft] = useState(60);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedQuestion, setSpeedQuestion] = useState(0);
  const [speedQuestions, setSpeedQuestions] = useState([]);
  const [speedActive, setSpeedActive] = useState(false);

  // Daily Challenge
  const [dailyQuestions, setDailyQuestions] = useState([]);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);
  const [dailyDone, setDailyDone] = useState(false);

  // Reverse Flashcards (English → dialect)
  const [reverseCards, setReverseCards] = useState([]);
  const [reverseIndex, setReverseIndex] = useState(0);
  const [reverseFlipped, setReverseFlipped] = useState(false);
  const [reverseKnown, setReverseKnown] = useState({});

  // Speed Round: generate questions from lessons + expanded data + dictionary
  const startSpeedRound = useCallback(() => {
    const allCards = [];
    const cats = ["greetings", "numbers", "food", "verbs", "family", "emotions", "hawker", "travel", "body", "time", "daily_life"];
    for (const cat of cats) {
      const cards = lessons[selectedDialect]?.[cat] || [];
      for (const card of cards) allCards.push(card);
    }
    const extraCardsMap = { hokkien: hokkienFlashcards, cantonese: cantoneseFlashcards, teochew: teochewFlashcards, hakka: hakkaFlashcards, hainanese: hainaneseFlashcards };
    const extraCards = extraCardsMap[selectedDialect];
    if (extraCards) {
      for (const cat of cats) {
        const cards = extraCards[cat] || [];
        for (const card of cards) allCards.push(card);
      }
    }
    if (apiWords.length > 0) {
      const dictWords = apiWords.filter(w => w.dialect === selectedDialect);
      for (const w of dictWords) {
        const phrase = w.headword?.romanized || '';
        if (phrase && !allCards.find(c => c.phrase === phrase)) {
          allCards.push({
            phrase,
            chinese: w.headword?.traditional || '',
            meaning: w.definitions?.[0]?.english || '',
            romanisation: phrase,
            ipa: w.pronunciations?.[0]?.ipa || '',
            pos: w.part_of_speech || '',
            examples: w.definitions?.[0]?.examples || [],
          });
        }
      }
    }
    const shuffled = allCards.sort(() => Math.random() - 0.5).slice(0, 20);
    const questions = shuffled.map(card => {
      const wrongCards = allCards.filter(c => c.phrase !== card.phrase).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [card.phrase, ...wrongCards.map(c => c.phrase)].sort(() => Math.random() - 0.5);
      return {
        english: card.meaning,
        chinese: card.chinese,
        ipa: card.ipa || '',
        pos: card.pos || '',
        options,
        correctIndex: options.indexOf(card.phrase),
        answerPhrase: card.phrase,
      };
    });
    setSpeedQuestions(questions);
    setSpeedQuestion(0);
    setSpeedScore(0);
    setSpeedTimeLeft(60);
    setSpeedActive(true);
  }, [selectedDialect]);

  // Stop the clock once every speed-round question has been answered, so the
  // timer doesn't keep ticking behind the results screen.
  useEffect(() => {
    if (speedActive && speedQuestions.length > 0 && speedQuestion >= speedQuestions.length) {
      setSpeedActive(false);
    }
  }, [speedQuestion, speedQuestions.length, speedActive]);

  // Speed round timer
  useEffect(() => {
    if (!speedActive || speedTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setSpeedTimeLeft(t => {
        if (t <= 1) {
          setSpeedActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [speedActive, speedTimeLeft]);

  // Daily Challenge: 10 questions across all dialects using dictionary as primary source
  const startDailyChallenge = useCallback(() => {
    const allDialects = ["hokkien", "cantonese", "teochew", "hakka", "hainanese"];
    const dialectColors = { hokkien: "#C0392B", cantonese: "#8E44AD", teochew: "#1A6B3C", hakka: "#D4860B", hainanese: "#1A7EA6" };
    const allCards = [];
    for (const d of allDialects) {
      const dictWords = apiWords.filter(w => w.dialect === d);
      for (const w of dictWords) {
        const phrase = w.headword?.romanized || '';
        if (phrase) {
          allCards.push({
            phrase,
            chinese: w.headword?.traditional || '',
            meaning: w.definitions?.[0]?.english || '',
            romanisation: phrase,
            ipa: w.pronunciations?.[0]?.ipa || '',
            pos: w.part_of_speech || '',
            examples: w.definitions?.[0]?.examples || [],
            dialect: d,
            dialectColor: dialectColors[d],
          });
        }
      }
    }
    if (allCards.length < 10) {
      const cats = ["greetings", "numbers", "food", "verbs", "family", "emotions", "hawker", "travel", "body", "time", "daily_life"];
      for (const d of allDialects) {
        for (const cat of cats) {
          const cards = lessons[d]?.[cat] || [];
          for (const card of cards) {
            if (!allCards.find(c => c.phrase === card.phrase)) {
              allCards.push({ ...card, dialect: d, dialectColor: dialectColors[d], ipa: '', pos: '', examples: [] });
            }
          }
        }
      }
    }
    const seed = getDailyChallengeSeed();
    const rng = seededRandom(seed);
    const shuffled = allCards.sort(() => rng() - 0.5).slice(0, 10);
    const questions = shuffled.map(card => {
      const wrongCards = allCards.filter(c => c.phrase !== card.phrase).sort(() => rng() - 0.5).slice(0, 3);
      const options = [card.phrase, ...wrongCards.map(c => c.phrase)].sort(() => rng() - 0.5);
      return {
        english: card.meaning,
        chinese: card.chinese,
        ipa: card.ipa || '',
        pos: card.pos || '',
        dialect: card.dialect,
        dialectColor: card.dialectColor,
        options,
        correctIndex: options.indexOf(card.phrase),
      };
    });
    setDailyQuestions(questions);
    setDailyIndex(0);
    setDailyScore(0);
    setDailyDone(false);
    setSelectedAnswer(null);
    setQuizShowResult(false);
  }, []);

  // Reverse Flashcards: load cards from dictionary + hardcoded for current dialect + category
  const startReverseCards = useCallback(() => {
    const cards = [];
    const dictMatches = apiWords.filter(w => w.dialect === selectedDialect && (w.tags || []).includes(selectedCategory));
    for (const w of dictMatches) {
      cards.push({
        phrase: w.headword?.romanized || '',
        chinese: w.headword?.traditional || '',
        meaning: w.definitions?.[0]?.english || '',
        romanisation: w.headword?.romanized || '',
        ipa: w.pronunciations?.[0]?.ipa || '',
        pos: w.part_of_speech || '',
        examples: w.definitions?.[0]?.examples || [],
        cardIndex: cards.length,
      });
    }
    const staticCards = lessons[selectedDialect]?.[selectedCategory] || [];
    for (const sc of staticCards) {
      if (!cards.find(c => c.phrase === sc.phrase)) {
        cards.push({ ...sc, ipa: '', pos: '', examples: [], cardIndex: cards.length });
      }
    }
    setReverseCards(cards.sort(() => Math.random() - 0.5));
    setReverseIndex(0);
    setReverseFlipped(false);
  }, [selectedDialect, selectedCategory]);

  // Deep-link support: /learn/[dialect]?mode=daily-challenge (used by the
  // home dashboard's "Today's Challenge" card) jumps straight into a mode.
  const searchParams = useSearchParams();
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (!mode) return;
    setLessonMode(mode);
    if (mode === 'daily-challenge') startDailyChallenge();
    if (mode === 'speed-round') startSpeedRound();
    if (mode === 'reverse-cards') startReverseCards();
    if (mode === 'review') startReview();
  }, []);

  // Build flashcard deck: hardcoded lessons + dictionary words with full rich data
  function buildCardsForCategory(catId) {
    const dictForCat = selectedDialect ? apiWords.filter(w => w.dialect === selectedDialect && (w.tags || []).includes(catId)) : [];
    const staticCards = (selectedDialect && lessons[selectedDialect]?.[catId]) || [];
    const richStatic = staticCards.map(sc => {
      const dictMatch = dictForCat.find(d => d.headword?.romanized === sc.phrase);
      if (dictMatch) {
        return {
          phrase: sc.phrase,
          chinese: sc.chinese,
          meaning: sc.meaning,
          romanisation: sc.romanisation,
          ipa: dictMatch.pronunciations?.[0]?.ipa || '',
          pos: dictMatch.part_of_speech || '',
          examples: dictMatch.definitions?.[0]?.examples || [],
          frequency: dictMatch.frequency || 'common',
          register: dictMatch.register || 'informal',
          fromDictionary: true,
        };
      }
      return { ...sc, ipa: '', pos: '', examples: [], frequency: 'common', register: 'informal', fromDictionary: false };
    });
    const dictCards = dictForCat.filter(d => !staticCards.find(s => s.phrase === d.headword?.romanized)).map(d => ({
      phrase: d.headword?.romanized || '',
      chinese: d.headword?.traditional || '',
      meaning: d.definitions?.[0]?.english || '',
      romanisation: d.headword?.romanized || '',
      ipa: d.pronunciations?.[0]?.ipa || '',
      pos: d.part_of_speech || '',
      examples: d.definitions?.[0]?.examples || [],
      frequency: d.frequency || 'common',
      register: d.register || 'informal',
      fromDictionary: true,
    }));
    return [...richStatic, ...dictCards];
  }
  const cards = buildCardsForCategory(selectedCategory);
  // Keep cardIndex in range: the deck can shrink after dictionary words load
  // in, or when switching categories, which would otherwise leave cardIndex
  // pointing past the end and render a blank card.
  useEffect(() => {
    if (cardIndex > cards.length - 1) setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);
  const safeCardIndex = cards.length > 0 ? Math.min(cardIndex, cards.length - 1) : 0;
  const currentCard = cards[safeCardIndex];

  // Fill-in-the-blank exercises: static seed set + exercises generated live from
  // dictionary DB words that have example sentences. This makes the game grow as
  // contributors add words and usage examples rather than being a fixed list.
  // Memoised on the dialect + dictionary size so it doesn't reshuffle each render.
  const sentenceExercises = useMemo(() => {
    const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const dictWords = apiWords.filter(w => w.dialect === selectedDialect);
    const answerPool = [...new Set(dictWords.map(w => w.headword?.romanized).filter(Boolean))];
    const dynamic = [];
    for (const w of dictWords) {
      const answer = w.headword?.romanized;
      if (!answer || answerPool.length < 4) continue;
      const ex = (w.definitions?.[0]?.examples || [])[0];
      const sentence = ex?.text_source_lang;
      if (!sentence) continue;
      const idx = sentence.toLowerCase().indexOf(answer.toLowerCase());
      if (idx === -1) continue;
      // Skip degenerate cases where the "sentence" is just the word itself.
      const remainder = sentence.replace(new RegExp(escapeRegExp(answer), "i"), "").replace(/[!?.,;:'"()]/g, "").trim();
      if (remainder.length < 3) continue;
      const blanked = sentence.slice(0, idx) + "___" + sentence.slice(idx + answer.length);
      const distractors = answerPool.filter(p => p.toLowerCase() !== answer.toLowerCase()).sort(() => Math.random() - 0.5).slice(0, 3);
      if (distractors.length < 3) continue;
      const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
      dynamic.push({
        sentence: blanked,
        options,
        correctIndex: options.indexOf(answer),
        meaning: ex.text_target_lang || w.definitions?.[0]?.english || "",
      });
    }
    const seed = sentenceCompletion[selectedDialect] || [];
    // Cap so a session stays bite-sized; prefer a mix of seed + dynamic.
    return [...seed, ...dynamic.sort(() => Math.random() - 0.5)].slice(0, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDialect, apiWords.length]);

  // Keep the fill-in-blank pointer in range if the exercise set changes.
  useEffect(() => {
    if (sentenceIndex > sentenceExercises.length - 1) { setSentenceIndex(0); setSelectedAnswer(null); setQuizShowResult(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentenceExercises.length]);

  // Review mode: cards across every category not yet marked "known"
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewPos, setReviewPos] = useState(0);
  const [reviewFlipped2, setReviewFlipped2] = useState(false);

  function startReview() {
    const queue = [];
    for (const cat of categories) {
      const catCards = buildCardsForCategory(cat.id);
      catCards.forEach((card, idx) => {
        const key = `${selectedDialect}-${cat.id}-${idx}`;
        if (!knownCards[key]) queue.push({ category: cat.id, idx, card });
      });
    }
    setReviewQueue(queue.sort(() => Math.random() - 0.5));
    setReviewPos(0);
    setReviewFlipped2(false);
  }

  function nextCard() {
    setFlipped(false);
    setTimeout(() => {
      if (cardIndex < cards.length - 1) setCardIndex(cardIndex + 1);
      else {
        const key = `${selectedDialect}-${selectedCategory}`;
        setProgress(p => ({ ...p, [key]: true }));
        setCardIndex(0);
      }
    }, 150);
  }

  function prevCard() {
    setFlipped(false);
    setTimeout(() => setCardIndex(Math.max(0, cardIndex - 1)), 150);
  }

  if (!dialect) {
    notFound();
  }

  return (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

          {/* Dialect Header — compact */}
          <div style={{ background: `linear-gradient(135deg, ${dialect.color}18, ${dialect.color}08)`, border: `1.5px solid ${dialect.color}30`, borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <SealChip dialect={dialect} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "var(--color-text)" }}>{dialect.name}</div>
              <div style={{ fontSize: 18, color: dialect.color, fontFamily: "var(--font-chinese)" }}>{dialect.chinese}</div>
            </div>
            <button className="btn-secondary" onClick={() => router.push("/learn")} style={{ fontSize: 13, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ArrowLeft size={15} /> Back
            </button>
          </div>

          {/* Mode Selector — card grid */}
          <div className="mode-grid" style={{ marginBottom: 32 }}>
            {[
              { mode: "flashcards", icon: BookOpen, label: "Flashcards", desc: "Tap to flip & learn" },
              { mode: "situational-quiz", icon: Clapperboard, label: "Story Quiz", desc: "Real-life scenarios" },
              { mode: "completing-sentence", icon: PenLine, label: "Fill in Blank", desc: "Complete sentences" },
              { mode: "speed-round", icon: Zap, label: "Speed Round", desc: "60s rapid fire" },
              { mode: "daily-challenge", icon: Trophy, label: "Daily Challenge", desc: "10 mixed questions" },
              { mode: "reverse-cards", icon: Repeat, label: "Reverse Cards", desc: "English → dialect" },
              { mode: "review", icon: Star, label: "Review", desc: "Cards you don't know yet" },
            ].map(({ mode, icon: Icon, label, desc }) => (
              <button key={mode} className="tab-btn" onClick={() => {
                setLessonMode(mode);
                setSelectedAnswer(null); setQuizShowResult(false); setCompletionData(null);
                if (mode === "situational-quiz") { setSituationalQuizIndex(0); setSituationalCueIndex(0); setSituationalScore(0); }
                if (mode === "completing-sentence") { setSentenceIndex(0); setSentenceScore(0); }
                if (mode === "speed-round") startSpeedRound();
                if (mode === "daily-challenge") startDailyChallenge();
                if (mode === "reverse-cards") startReverseCards();
                if (mode === "review") startReview();
              }} style={{
                padding: "14px 10px", borderRadius: "var(--radius-md)",
                background: lessonMode === mode ? dialect.color : "var(--color-surface)",
                color: lessonMode === mode ? "white" : "var(--color-text-secondary)",
                border: `2px solid ${lessonMode === mode ? dialect.color : "var(--color-border)"}`,
                textAlign: "center", boxShadow: lessonMode === mode ? `0 4px 16px ${dialect.color}40` : "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <Icon size={22} style={{ marginBottom: 4 }} />
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{desc}</div>
              </button>
            ))}
          </div>

          {/* ─── FLASHCARDS ─── */}
          {lessonMode === "flashcards" && (
            <div>
              {/* Category tabs — includes dictionary tags + part_of_speech */}
              {(() => {
                const capitalize = s => s.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
                // Get all unique tags from dictionary for this dialect
                const dictTags = selectedDialect ? [...new Set(apiWords.filter(w => w.dialect === selectedDialect).flatMap(w => w.tags || []))] : [];
                // Get all unique POS from dictionary for this dialect
                const dictPOS = selectedDialect ? [...new Set(apiWords.filter(w => w.dialect === selectedDialect).map(w => w.part_of_speech).filter(Boolean))] : [];
                // Build category list: static + dictionary tags + POS
                const staticCats = categories.map(c => c.id);
                const dictOnlyTags = dictTags.filter(t => !staticCats.includes(t)).map(t => ({ id: t, label: capitalize(t) }));
                const posCats = dictOnlyTags.filter(c => ['verb','noun','adjective','adverb','interjection','expression','numeral','conjunction'].includes(c.id));
                const tagCats = dictOnlyTags.filter(c => !['verb','noun','adjective','adverb','interjection','expression','numeral','conjunction'].includes(c.id));
                const posCategory = { id: 'by_pos', label: 'By Part of Speech' };
                const allCats = [...categories, ...tagCats];
                
                // Count cards per category
                const getCardCount = (catId) => {
                  if (catId === 'by_pos') return dictPOS.length;
                  const staticCount = lessons[selectedDialect]?.[catId]?.length || 0;
                  const dictCount = apiWords.filter(w => w.dialect === selectedDialect && (w.tags || []).includes(catId)).length;
                  return staticCount + dictCount;
                };
                
                return (
                  <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                    {allCats.map(cat => {
                      const key = `${selectedDialect}-${cat.id}`;
                      const done = progress[key];
                      const knownCount = Object.keys(knownCards).filter(k => k.startsWith(`${selectedDialect}-${cat.id}-`)).length;
                      const total = getCardCount(cat.id);
                      const CatIcon = CATEGORY_ICONS[cat.id] || Languages;
                      return (
                        <button key={cat.id} className="tab-btn" onClick={() => { setSelectedCategory(cat.id); setCardIndex(0); setFlipped(false); }}
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
                  {Object.keys(knownCards).filter(k => k.startsWith(`${selectedDialect}-${selectedCategory}-`)).length} known
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
                    <button onClick={(e) => { e.stopPropagation(); speak(currentCard?.phrase, selectedDialect); }}
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
                    <button onClick={(e) => { e.stopPropagation(); speak(currentCard?.phrase, selectedDialect); }}
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
                    const key = `${selectedDialect}-${selectedCategory}-${cardIndex}`;
                    setKnownCards(prev => { const n = { ...prev }; delete n[key]; return n; });
                    setFlipped(false);
                    setTimeout(() => setCardIndex(c => Math.max(0, c - 1)), 150);
                  }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
                    <Repeat size={15} /> Review Again
                  </button>
                  <button className="btn-hover" onClick={() => {
                    const key = `${selectedDialect}-${selectedCategory}-${cardIndex}`;
                    setKnownCards(prev => ({ ...prev, [key]: true }));
                    setFlipped(false);
                    setTimeout(() => {
                      if (cardIndex < cards.length - 1) {
                        setCardIndex(c => c + 1);
                      } else {
                        setProgress(p => ({ ...p, [`${selectedDialect}-${selectedCategory}`]: true }));
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
                <button className="btn-hover" onClick={() => { setLessonMode("situational-quiz"); setCompletionData(null); }}
                  style={{ background: dialect.color, color: "white", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Try Story Quiz <ArrowRight size={15} />
                </button>
              </div>
              </>
              )}
            </div>
          )}

          {/* ─── SITUATIONAL QUIZ ─── */}
          {lessonMode === "situational-quiz" && (
            <div>
              {(() => {
                const quizzes = situationalQuizzes[selectedDialect] || [];
                if (quizzes.length === 0) return <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>No quizzes available for this dialect yet.</div>;
                const quiz = quizzes[situationalQuizIndex];
                const totalScenes = quiz.cues.length;

                // Completion screen
                if (completionData?.mode === "situational-quiz") {
                  const pct = Math.round((completionData.score / completionData.total) * 100);
                  const grade = pct >= 80 ? { label: "Excellent!", color: "#1A6B3C", bg: "#EAFAF1", icon: "" }
                    : pct >= 60 ? { label: "Good job!", color: "#8E44AD", bg: "#F5EEF8", icon: "" }
                    : { label: "Keep practising!", color: "#E67E22", bg: "#FEF9E7", icon: "" };
                  return (
                    <div style={{ textAlign: "center" }} className="fade-up">
                      <div style={{ marginBottom: 16 }}><Trophy size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>Story Complete!</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32 }}>{quiz.title}</p>
                      <div style={{ background: grade.bg, border: `2px solid ${grade.color}40`, borderRadius: 20, padding: "32px 24px", marginBottom: 32 }}>
                        <div style={{ fontSize: 56, fontWeight: 800, color: grade.color, fontFamily: "var(--font-serif)" }}>{completionData.score}<span style={{ fontSize: 28 }}>/{completionData.total}</span></div>
                        <div style={{ fontSize: 20, color: grade.color, fontWeight: 700, marginTop: 4 }}>{grade.label}</div>
                        <div style={{ fontSize: 14, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button className="btn-hover" onClick={() => {
                          setSituationalQuizIndex(0); setSituationalCueIndex(0); setSelectedAnswer(null);
                          setQuizShowResult(false); setSituationalScore(0); setCompletionData(null);
                        }} style={{ padding: "12px 24px", background: "white", border: `2px solid ${dialect.color}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: dialect.color, cursor: "pointer", fontFamily: "inherit" }}>
                          <Repeat size={15} /> Try Again
                        </button>
                        <button className="btn-hover" onClick={() => { setLessonMode("completing-sentence"); setCompletionData(null); }}
                          style={{ padding: "12px 24px", background: dialect.color, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Try Fill in Blank <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                }

                const cue = quiz.cues[situationalCueIndex];
                return (
                  <div>
                    {/* Header: score + progress */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: "#6B5B45" }}>
                        <span style={{ fontWeight: 700, color: "#1A1208" }}>{quiz.title}</span>
                      </div>
                      <div style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: dialect.color }}>
                        {situationalScore} / {totalScenes} ✓
                      </div>
                    </div>

                    {/* Scene progress dots */}
                    <div style={{ display: "flex", gap: 5, marginBottom: 24, alignItems: "center" }}>
                      {quiz.cues.map((_, i) => (
                        <div key={i} style={{
                          flex: i === situationalCueIndex ? 3 : 1,
                          height: 8, borderRadius: 4,
                          background: i < situationalCueIndex ? dialect.color : i === situationalCueIndex ? dialect.color : "#E8DDD0",
                          opacity: i < situationalCueIndex ? 0.45 : 1,
                          transition: "all 0.35s ease"
                        }} />
                      ))}
                    </div>

                    {/* Scene badge + context */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${dialect.color}15`, border: `1.5px solid ${dialect.color}35`, borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: dialect.color, textTransform: "uppercase", letterSpacing: 1 }}>Scene {situationalCueIndex + 1} of {totalScenes}</span>
                      </div>
                      <div style={{ background: "#F9F5EE", borderRadius: 14, padding: "18px 20px", border: `2px solid ${dialect.color}25` }}>
                        <div style={{ fontSize: 12, color: "#9B8B75", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}><MessageCircle size={13} /> WHAT WOULD YOU SAY?</div>
                        <div style={{ fontSize: 15, color: "#1A1208", lineHeight: 1.6 }}>
                          <AnnotatedText text={cue.context} dialectColor={dialect.color} />
                        </div>
                      </div>
                    </div>

                    {/* Result feedback banner */}
                    {quizShowResult && (
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
                        if (!quizShowResult && isSelected) { border = dialect.color; bg = `${dialect.color}12`; shadow = `0 2px 8px ${dialect.color}30`; }
                        if (quizShowResult) {
                          if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                          else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                        }
                        return (
                          <button key={idx} className="btn-hover" onClick={() => !quizShowResult && setSelectedAnswer(idx)}
                            style={{ padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 14, cursor: quizShowResult ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s", boxShadow: shadow }}>
                            <div style={{ fontWeight: 700, marginBottom: 3 }}>
                              <DialectTooltip phrase={dialogue.phrase} meaning={dialogue.meaning} color={dialect.color} />
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.65 }}>"{dialogue.meaning}"</div>
                            <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); speak(dialogue.phrase, selectedDialect); }}
                              className="btn-tts"
                              style={{ marginTop: 6, padding: "4px 12px", background: `${dialect.color}10`, border: `1px solid ${dialect.color}30`, borderRadius: 12, color: dialect.color, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Volume2 size={15} /> Hear
                            </span>
                            {quizShowResult && isCorrect && <span style={{ float: "right", fontSize: 18, marginTop: -20 }}>✓</span>}
                            {quizShowResult && isSelected && !isCorrect && <span style={{ float: "right", fontSize: 18, marginTop: -20 }}>✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action button */}
                    {!quizShowResult ? (
                      <button className="btn-hover" onClick={() => {
                        const correct = cue.dialogues[selectedAnswer]?.correct;
                        if (correct) setSituationalScore(s => s + 1);
                        setQuizShowResult(true);
                      }} disabled={selectedAnswer === null}
                        style={{ width: "100%", padding: "14px", background: selectedAnswer !== null ? dialect.color : "#E8DDD0", color: selectedAnswer !== null ? "white" : "#9B8B75", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedAnswer !== null ? "pointer" : "default", fontFamily: "inherit" }}>
                        Check Answer
                      </button>
                    ) : (
                      <button className="btn-hover" onClick={() => {
                        const isLastCue = situationalCueIndex >= quiz.cues.length - 1;
                        const isLastScenario = situationalQuizIndex >= quizzes.length - 1;
                        if (!isLastCue) {
                          setSituationalCueIndex(c => c + 1);
                          setSelectedAnswer(null); setQuizShowResult(false);
                        } else if (!isLastScenario) {
                          setSituationalQuizIndex(i => i + 1);
                          setSituationalCueIndex(0); setSelectedAnswer(null); setQuizShowResult(false);
                        } else {
                          setCompletionData({ mode: "situational-quiz", score: situationalScore, total: totalScenes });
                        }
                      }}
                        style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {situationalCueIndex < quiz.cues.length - 1 ? <>Next Scene <ArrowRight size={15} /></> : situationalQuizIndex < quizzes.length - 1 ? <>Next Story <ArrowRight size={15} /></> : <>View Results <ArrowRight size={15} /></>}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── COMPLETING SENTENCE ─── */}
          {lessonMode === "completing-sentence" && (
            <div>
              {(() => {
                const exercises = sentenceExercises;
                if (exercises.length === 0) return <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>No exercises available yet.</div>;

                // Completion screen
                if (completionData?.mode === "completing-sentence") {
                  const pct = Math.round((completionData.score / completionData.total) * 100);
                  const grade = pct >= 80 ? { label: "Excellent!", color: "#1A6B3C", bg: "#EAFAF1", icon: "" }
                    : pct >= 60 ? { label: "Good job!", color: "#8E44AD", bg: "#F5EEF8", icon: "" }
                    : { label: "Keep practising!", color: "#E67E22", bg: "#FEF9E7", icon: "" };
                  return (
                    <div style={{ textAlign: "center" }} className="fade-up">
                      <div style={{ marginBottom: 16 }}><Trophy size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>All Done!</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32 }}>Fill in the Blank — {dialect.name}</p>
                      <div style={{ background: grade.bg, border: `2px solid ${grade.color}40`, borderRadius: 20, padding: "32px 24px", marginBottom: 32 }}>
                        <div style={{ fontSize: 56, fontWeight: 800, color: grade.color, fontFamily: "var(--font-serif)" }}>{completionData.score}<span style={{ fontSize: 28 }}>/{completionData.total}</span></div>
                        <div style={{ fontSize: 20, color: grade.color, fontWeight: 700, marginTop: 4 }}>{grade.label}</div>
                        <div style={{ fontSize: 14, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button className="btn-hover" onClick={() => {
                          setSentenceIndex(0); setSelectedAnswer(null); setQuizShowResult(false);
                          setSentenceScore(0); setCompletionData(null);
                        }} style={{ padding: "12px 24px", background: "white", border: `2px solid ${dialect.color}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: dialect.color, cursor: "pointer", fontFamily: "inherit" }}>
                          <Repeat size={15} /> Try Again
                        </button>
                        <button className="btn-hover" onClick={() => { setLessonMode("flashcards"); setCompletionData(null); }}
                          style={{ padding: "12px 24px", background: dialect.color, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Back to Flashcards
                        </button>
                      </div>
                    </div>
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
                        {sentenceScore} / {exercises.length} ✓
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
                                background: quizShowResult
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
                      {quizShowResult && (
                        <div style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                          "{exercise.meaning}"
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <button onClick={() => speak(exercise.sentence.replace('___', exercise.options[exercise.correctIndex] || ''), selectedDialect)}
                        style={{ padding: "8px 20px", background: "white", border: `2px solid ${dialect.color}40`, borderRadius: 20, color: dialect.color, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Volume2 size={15} /> Hear full sentence
                      </button>
                    </div>

                    {/* Result feedback */}
                    {quizShowResult && (
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {exercise.options.map((opt, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === exercise.correctIndex;
                        let bg = "white", border = "#E8DDD0", color = "#1A1208", shadow = "none";
                        if (!quizShowResult && isSelected) { border = dialect.color; bg = `${dialect.color}12`; shadow = `0 2px 8px ${dialect.color}30`; }
                        if (quizShowResult) {
                          if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                          else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                        }
                        return (
                          <button key={idx} className="btn-hover" onClick={() => !quizShowResult && setSelectedAnswer(idx)}
                            style={{ padding: "15px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: quizShowResult ? "default" : "pointer", color, fontFamily: "inherit", transition: "all 0.2s", boxShadow: shadow, position: "relative" }}>
                            {opt}
                            {quizShowResult && isCorrect && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✓</span>}
                            {quizShowResult && isSelected && !isCorrect && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action button */}
                    {!quizShowResult ? (
                      <button className="btn-hover" onClick={() => {
                        const correct = selectedAnswer === exercise.correctIndex;
                        if (correct) setSentenceScore(s => s + 1);
                        setQuizShowResult(true);
                      }} disabled={selectedAnswer === null}
                        style={{ width: "100%", padding: "14px", background: selectedAnswer !== null ? dialect.color : "#E8DDD0", color: selectedAnswer !== null ? "white" : "#9B8B75", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: selectedAnswer !== null ? "pointer" : "default", fontFamily: "inherit" }}>
                        Check Answer
                      </button>
                    ) : (
                      <button className="btn-hover" onClick={() => {
                        if (sentenceIndex < exercises.length - 1) {
                          setSentenceIndex(i => i + 1);
                          setSelectedAnswer(null); setQuizShowResult(false);
                        } else {
                          setCompletionData({ mode: "completing-sentence", score: sentenceScore, total: exercises.length });
                        }
                      }}
                        style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {sentenceIndex < exercises.length - 1 ? <>Next <ArrowRight size={15} /></> : <>View Results <ArrowRight size={15} /></>}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── SPEED ROUND ─── */}
          {lessonMode === "speed-round" && (
            <div>
              {(() => {
                if (!speedActive && speedQuestions.length === 0) {
                  return (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                      <div style={{ marginBottom: 16 }}><Zap size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>Speed Round</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                        Answer as many questions as you can in 60 seconds! +10 XP per correct answer, +15 for speed bonus.
                      </p>
                      <button className="btn-hover" onClick={() => startSpeedRound()}
                        style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Start Speed Round <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                }

                if (speedTimeLeft <= 0 || speedQuestion >= speedQuestions.length) {
                  const pct = speedQuestions.length > 0 ? Math.round((speedScore / speedQuestions.length) * 100) : 0;
                  return (
                    <div style={{ textAlign: "center" }} className="fade-up">
                      <div style={{ fontSize: 64, marginBottom: 16 }}><Zap size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 8 }}>Time's Up!</h2>
                      <div style={{ background: `${dialect.color}18`, border: `2px solid ${dialect.color}40`, borderRadius: 20, padding: "32px 24px", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                        <div style={{ fontSize: 56, fontWeight: 800, color: dialect.color, fontFamily: "var(--font-serif)" }}>{speedScore}<span style={{ fontSize: 28 }}>/{speedQuestions.length}</span></div>
                        <div style={{ fontSize: 16, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
                        <div style={{ fontSize: 14, color: dialect.color, fontWeight: 600, marginTop: 8 }}>+{speedScore * XP_REWARDS.speedRoundCorrect} XP earned!</div>
                      </div>
                      <button className="btn-hover" onClick={() => { setSpeedActive(false); setSpeedQuestions([]); setSpeedScore(0); setSpeedQuestion(0); setSpeedTimeLeft(60); }}
                        style={{ padding: "12px 24px", background: dialect.color, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <Repeat size={15} /> Try Again
                      </button>
                    </div>
                  );
                }

                const q = speedQuestions[speedQuestion];
                return (
                  <div>
                    {/* Timer bar */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6B5B45" }}>
                        <span>Question {speedQuestion + 1} of {speedQuestions.length}</span>
                        <span style={{ color: speedTimeLeft <= 10 ? "#C0392B" : dialect.color, fontWeight: 700, fontSize: 16 }}>{speedTimeLeft}s</span>
                      </div>
                      <div style={{ height: 8, background: "#E8DDD0", borderRadius: 4 }}>
                        <div style={{ width: `${(speedTimeLeft / 60) * 100}%`, height: "100%", background: speedTimeLeft <= 10 ? "#C0392B" : dialect.color, borderRadius: 4, transition: "width 1s linear" }} />
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                      <span style={{ background: `${dialect.color}18`, border: `1.5px solid ${dialect.color}40`, borderRadius: 20, padding: "6px 16px", fontSize: 14, fontWeight: 700, color: dialect.color }}>
                        Score: {speedScore}
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {q.options.map((opt, idx) => (
                        <button key={idx} className="btn-hover" onClick={() => {
                          const correct = idx === q.correctIndex;
                          if (correct) {
                            setSpeedScore(s => s + 1);
                            awardXp(XP_REWARDS.speedRoundCorrect, 'speed round');
                          }
                          setSpeedQuestion(i => i + 1);
                        }}
                          style={{ padding: "14px 16px", background: "white", border: `2px solid #E8DDD0`, borderRadius: 12, fontSize: 14, cursor: "pointer", color: "#1A1208", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
                          <div className="romanized" style={{ fontWeight: 700 }}>{opt}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── DAILY CHALLENGE ─── */}
          {lessonMode === "daily-challenge" && (
            <div>
              {(() => {
                if (dailyQuestions.length === 0 && !dailyDone) {
                  return (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                      <div style={{ marginBottom: 16 }}><Trophy size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>Daily Challenge</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 16, maxWidth: 400, margin: "0 auto 16px" }}>
                        10 questions across all dialects. Test your knowledge and earn bonus XP!
                      </p>
                      <div style={{ background: "#FEF9E2", borderRadius: 12, padding: "12px 20px", marginBottom: 32, display: "inline-block", fontSize: 13, color: "#8B6020" }}>
                        <Flame size={16} /> {streak} day streak • {xp} XP total
                      </div>
                      <br />
                      <button className="btn-hover" onClick={() => startDailyChallenge()}
                        style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Start Challenge <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                }

                if (dailyDone) {
                  const pct = Math.round((dailyScore / dailyQuestions.length) * 100);
                  return (
                    <div style={{ textAlign: "center" }} className="fade-up">
                      <div style={{ display:"flex", justifyContent:"center", marginBottom:16, color:"var(--color-primary)" }}><Trophy size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 8 }}>Challenge Complete!</h2>
                      <div style={{ background: "#EAFAF1", border: "2px solid #27AE6040", borderRadius: 20, padding: "32px 24px", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                        <div style={{ fontSize: 56, fontWeight: 800, color: "#1A6B3C", fontFamily: "var(--font-serif)" }}>{dailyScore}<span style={{ fontSize: 28 }}>/{dailyQuestions.length}</span></div>
                        <div style={{ fontSize: 16, color: "#6B5B45", marginTop: 8 }}>{pct}% correct</div>
                        <div style={{ fontSize: 14, color: "#1A6B3C", fontWeight: 600, marginTop: 8 }}>+{dailyScore * XP_REWARDS.correctAnswer + XP_REWARDS.dailyComplete} XP earned!</div>
                      </div>
                      <button className="btn-hover" onClick={() => { setDailyDone(false); setDailyQuestions([]); setDailyIndex(0); setDailyScore(0); }}
                        style={{ padding: "12px 24px", background: dialect.color, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <Repeat size={15} /> Try Again
                      </button>
                    </div>
                  );
                }

                const q = dailyQuestions[dailyIndex];
                return (
                  <div>
                    {/* Progress */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6B5B45" }}>
                      <span>Question {dailyIndex + 1} of {dailyQuestions.length}</span>
                      <span style={{ color: dialect.color, fontWeight: 700 }}>Score: {dailyScore}</span>
                    </div>
                    <div style={{ height: 8, background: "#E8DDD0", borderRadius: 4, marginBottom: 24 }}>
                      <div style={{ width: `${((dailyIndex + 1) / dailyQuestions.length) * 100}%`, height: "100%", background: dialect.color, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>

                    {/* Dialect badge */}
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 11, background: q.dialectColor + "18", color: q.dialectColor, padding: "4px 12px", borderRadius: 12, fontWeight: 700 }}>{q.dialect}</span>
                    </div>

                    {/* Question */}
                    <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24 }}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>Translate</div>
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "white" }}>{q.english}</div>
                      {q.chinese && <div style={{ fontFamily: "var(--font-chinese)", fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{q.chinese}</div>}
                    </div>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <button onClick={() => speak(q.options[q.correctIndex] || '', q.dialect || selectedDialect)}
                        style={{ padding: "6px 16px", background: "white", border: `2px solid ${dialect.color}30`, borderRadius: 16, color: dialect.color, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Volume2 size={15} /> Hear answer
                      </button>
                    </div>

                    {/* Options */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {q.options.map((opt, idx) => {
                        let bg = "white", border = "#E8DDD0", color = "#1A1208";
                        if (quizShowResult) {
                          if (idx === q.correctIndex) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                          else if (selectedAnswer === idx) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                        }
                        return (
                          <button key={idx} className="btn-hover" onClick={() => {
                            if (quizShowResult) return;
                            setSelectedAnswer(idx);
                            setQuizShowResult(true);
                            if (idx === q.correctIndex) {
                              setDailyScore(s => s + 1);
                              awardXp(XP_REWARDS.correctAnswer, 'correct');
                            }
                          }}
                            style={{ padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 14, cursor: quizShowResult ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
                            <div className="romanized" style={{ fontWeight: 700 }}>{opt}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Next button */}
                    {quizShowResult && (
                      <button className="btn-hover" onClick={() => {
                        if (dailyIndex < dailyQuestions.length - 1) {
                          setDailyIndex(i => i + 1);
                          setSelectedAnswer(null);
                          setQuizShowResult(false);
                        } else {
                          awardXp(XP_REWARDS.dailyComplete, 'daily challenge complete');
                          // Calculate new streak
                          const today = new Date().toISOString().split('T')[0];
                          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                          setStreak(prev => {
                            // If last daily was yesterday, increment streak; otherwise reset to 1
                            const lastDate = currentUser?.lastDailyDate;
                            if (lastDate === yesterday || lastDate === today) return prev + 1;
                            return 1;
                          });
                          markDailyComplete();
                          setDailyDone(true);
                        }
                      }}
                        style={{ width: "100%", padding: "14px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {dailyIndex < dailyQuestions.length - 1 ? <>Next <ArrowRight size={15} /></> : <>View Results <ArrowRight size={15} /></>}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── REVERSE CARDS ─── */}
          {lessonMode === "reverse-cards" && (
            <div>
              {(() => {
                if (reverseCards.length === 0) {
                  return (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                      <div style={{ marginBottom: 16 }}><Repeat size={56} /></div>
                      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>Reverse Flashcards</h2>
                      <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                        See the English meaning — pick the correct {dialect.name} phrase. Harder mode!
                      </p>
                      <button className="btn-hover" onClick={() => startReverseCards()}
                        style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Start Reverse Cards <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                }

                const card = reverseCards[reverseIndex];
                const knowCount = Object.keys(reverseKnown).filter(k => k.startsWith(`${selectedDialect}-reverse-`)).length;

                return (
                  <div>
                    {/* Progress */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#8B7355" }}>
                      <span>Card {reverseIndex + 1} of {reverseCards.length}</span>
                      <span style={{ color: dialect.color, fontWeight: 600 }}>{knowCount} known</span>
                    </div>
                    <div style={{ height: 4, background: "#E8DDD0", borderRadius: 2, marginBottom: 24 }}>
                      <div style={{ width: `${((reverseIndex + 1) / reverseCards.length) * 100}%`, height: "100%", background: dialect.color, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>

                    {/* Category tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                      {categories.map(cat => (
                        <button key={cat.id} className="tab-btn" onClick={() => { setSelectedCategory(cat.id); setReverseIndex(0); setReverseFlipped(false); startReverseCards(); }}
                          style={{ flex: "0 0 auto", padding: "8px 12px", borderRadius: 12, background: selectedCategory === cat.id ? dialect.color : "white", color: selectedCategory === cat.id ? "white" : "#1A1208", fontSize: 12, fontWeight: 600, border: `2px solid ${selectedCategory === cat.id ? dialect.color : "#E8DDD0"}`, whiteSpace: "nowrap" }}>
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Card */}
                    <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: "30px 28px", textAlign: "center", marginBottom: 24, cursor: "pointer" }}
                      onClick={() => setReverseFlipped(!reverseFlipped)}>
                      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", marginBottom: 16, textTransform: "uppercase" }}>Tap to {reverseFlipped ? "see question" : "reveal answer"}</div>
                      {!reverseFlipped ? (
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
                          <button onClick={(e) => { e.stopPropagation(); speak(card.phrase, selectedDialect); }}
                            className="btn-tts"
                            style={{ marginTop: 10, padding: "8px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Volume2 size={15} /> Hear pronunciation
                          </button>
                        </>
                      )}
                    </div>

                    {/* Know it / Still learning + nav */}
                    {reverseFlipped ? (
                      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                        <button className="btn-hover" onClick={() => {
                          const key = `${selectedDialect}-reverse-${card.cardIndex}`;
                          setReverseKnown(prev => { const n = { ...prev }; delete n[key]; return n; });
                          setReverseFlipped(false);
                          setTimeout(() => setReverseIndex(c => Math.max(0, c - 1)), 150);
                        }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
                          <Repeat size={15} /> Review Again
                        </button>
                        <button className="btn-hover" onClick={() => {
                          const key = `${selectedDialect}-reverse-${card.cardIndex}`;
                          setReverseKnown(prev => ({ ...prev, [key]: true }));
                          awardXp(XP_REWARDS.correctAnswer, 'correct');
                          setReverseFlipped(false);
                          setTimeout(() => {
                            if (reverseIndex < reverseCards.length - 1) {
                              setReverseIndex(c => c + 1);
                            } else {
                              setCompletionData({ mode: "reverse-cards", score: Object.keys(reverseKnown).length, total: reverseCards.length });
                              setReverseCards([]);
                            }
                          }, 150);
                        }} style={{ flex: 2, padding: "13px", background: "#EAFAF1", border: "2px solid #27AE60", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#1A6B3C", cursor: "pointer", fontFamily: "inherit" }}>
                          ✓ Know it!
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                        <button className="btn-hover" onClick={() => setReverseIndex(i => Math.max(0, i - 1))} disabled={reverseIndex === 0}
                          style={{ flex: 1, padding: "13px", background: reverseIndex === 0 ? "#F0EBE3" : "white", border: "2px solid #E8DDD0", borderRadius: 12, fontSize: 14, cursor: reverseIndex === 0 ? "default" : "pointer", color: reverseIndex === 0 ? "#C0B0A0" : "#1A1208", fontFamily: "inherit" }}>
                          <ArrowLeft size={15} /> Prev
                        </button>
                        <button className="btn-hover" onClick={() => {
                          if (reverseIndex < reverseCards.length - 1) {
                            setReverseIndex(i => i + 1);
                          } else {
                            setReverseIndex(0);
                          }
                        }} style={{ flex: 2, padding: "13px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          {reverseIndex < reverseCards.length - 1 ? <>Next <ArrowRight size={15} /></> : <><Repeat size={15} /> Restart</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── REVIEW (cards not yet known, across every category) ─── */}
          {lessonMode === "review" && (
            <div>
              {reviewQueue.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px" }}>
                  <div style={{ marginBottom: 16 }}><Star size={56} /></div>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 12 }}>All caught up!</h2>
                  <p style={{ color: "#6B5B45", fontSize: 15, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                    You've marked every card in this dialect as known. Keep learning new categories in Flashcards to build up more review material.
                  </p>
                  <button className="btn-hover" onClick={() => startReview()}
                    style={{ padding: "14px 36px", background: dialect.color, color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Refresh <Repeat size={15} />
                  </button>
                </div>
              ) : (() => {
                const item = reviewQueue[reviewPos];
                const card = item.card;
                return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#8B7355" }}>
                      <span>Card {reviewPos + 1} of {reviewQueue.length}</span>
                      <span style={{ color: dialect.color, fontWeight: 600 }}>{item.category.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="progress" style={{ marginBottom: 24 }}>
                      <div className="progress-fill" style={{ width: `${((reviewPos + 1) / reviewQueue.length) * 100}%`, background: dialect.color }} />
                    </div>

                    <div className="card-3d flashcard" style={{ marginBottom: 20 }} onClick={() => setReviewFlipped2(!reviewFlipped2)}>
                      <div className={`card-inner ${reviewFlipped2 ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
                        <div className="card-face" style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 20 }}>
                          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 14 }}>Tap to reveal meaning</div>
                          <div className="romanized" style={{ fontSize: 44, fontWeight: 700, color: "white", textAlign: "center", padding: "0 24px" }}>{card.phrase}</div>
                          <div style={{ fontFamily: "var(--font-chinese)", fontSize: 26, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>{card.chinese}</div>
                          <button onClick={(e) => { e.stopPropagation(); speak(card.phrase, selectedDialect); }}
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
                        setReviewFlipped2(false);
                        setTimeout(() => setReviewPos(p => (p + 1) % reviewQueue.length), 150);
                      }} style={{ flex: 1, padding: "13px", background: "#FDEDEC", border: "2px solid #E74C3C", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#C0392B", cursor: "pointer", fontFamily: "inherit" }}>
                        <Repeat size={15} /> Still learning
                      </button>
                      <button className="btn-hover" onClick={() => {
                        const key = `${selectedDialect}-${item.category}-${item.idx}`;
                        setKnownCards(prev => ({ ...prev, [key]: true }));
                        awardXp(XP_REWARDS.correctAnswer, 'reviewed');
                        setReviewFlipped2(false);
                        setTimeout(() => {
                          const nextQueue = reviewQueue.filter((_, i) => i !== reviewPos);
                          setReviewQueue(nextQueue);
                          setReviewPos(p => nextQueue.length ? p % nextQueue.length : 0);
                        }, 150);
                      }} style={{ flex: 2, padding: "13px", background: "#EAFAF1", border: "2px solid #27AE60", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#1A6B3C", cursor: "pointer", fontFamily: "inherit" }}>
                        ✓ Know it!
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* XP Bar */}
          <div style={{ marginTop: 32, background: "white", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #F0E8DA" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{getLevel(xp).icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1A1208" }}>{getLevel(xp).name}</span>
                <span style={{ fontSize: 12, color: "#8B7355" }}>• {xp} XP</span>
              </div>
              <div style={{ fontSize: 12, color: "#8B7355" }}>
                {getNextLevel(xp) ? `${getNextLevel(xp).minXP - xp} XP to ${getNextLevel(xp).name}` : "Max Level!"}
              </div>
            </div>
            <div style={{ height: 8, background: "#F0E8DA", borderRadius: 4 }}>
              <div style={{ width: `${getLevelProgress(xp)}%`, height: "100%", background: getLevel(xp).color, borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
            {streak > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#D4860B", fontWeight: 600 }}>
                <Flame size={16} /> {streak} day streak
              </div>
            )}
          </div>
        </div>
  );
}
