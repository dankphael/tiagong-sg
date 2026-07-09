'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import { useApp } from "@/components/AppProvider";
import { getAvatar } from "@/lib/avatar";
import { buildIntroEmailUrl } from "@/lib/emailTemplate";
import { hokkienFlashcards } from "@/data/flashcardsHokkien";
import { cantoneseFlashcards } from "@/data/flashcardsCantonese";
import { teochewFlashcards } from "@/data/flashcardsTeochew";
import { hakkaFlashcards } from "@/data/flashcardsHakka";
import { hainaneseFlashcards } from "@/data/flashcardsHainanese";
import newStoryQuizzes from "@/data/storyQuizzes";
import { speak, stopSpeaking, isTTSAvailable } from "@/lib/tts";
import { LEVELS, getLevel, getNextLevel, getLevelProgress, XP_REWARDS, calculateStreak, seededRandom, getDailyChallengeSeed } from "@/data/xpSystem";

import { CountUp, DialectTooltip, AnnotatedText, SealChip, Badge, Chip, SectionHeader, Card, IconButton } from "@/components/ui";
import {
  Menu, X, Search, MapPin, Users, Volume2, ArrowLeft, BookOpen, Clapperboard,
  PenLine, Zap, Trophy, Repeat, GraduationCap, ChevronDown, ChevronUp, Check,
  Plus, Sparkles, FolderOpen, User, Languages, ScrollText, Info, LayoutGrid,
  Heart, Mic, Star, Clock, Compass, MessageCircle, Globe, Flame, CalendarDays,
  ArrowRight, ChevronRight, Filter, BookMarked, Handshake, Map, UserCheck, Home, Smile,
  Plane, Utensils, Briefcase, PawPrint, Coffee, CupSoda, Hash, Waves, Car,
  Palette, Ruler, Flag, PersonStanding, Package, Phone, Mail, Printer,
  ThumbsUp, Sprout, Landmark, Building2, Mars, Venus,
} from "lucide-react";
import { dialects, huayKuan, lessons, singlishPhrases, situationalQuizzes, sentenceCompletion, categories } from "@/data/staticData";

// Lucide icon per category id — replaces the old emoji map for a consistent,
// intentional look. Falls back to Languages for unknown tags.
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

function DialectPlatformContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    currentUser, setCurrentUser, registeredUsers, setRegisteredUsers,
    xp, setXp, streak, setStreak, dailyCompleted, setDailyCompleted, markDailyComplete,
    progress, setProgress, knownCards, setKnownCards,
    selectedDialect, setSelectedDialect,
    apiWords, authError, setAuthError, successMessage, setSuccessMessage,
    pendingGoogle, setPendingGoogle, awardXp,
    handleGoogleSuccess: ctxHandleGoogleSuccess,
    completeProfile: ctxCompleteProfile,
    saveProfile: ctxSaveProfile,
    handleLogout: ctxHandleLogout,
  } = useApp();

  const [screen, setScreen] = useState("home"); // home | dialect | lesson | quiz
  const [lessonMode, setLessonMode] = useState("flashcards"); // flashcards | situational-quiz | completing-sentence
  const [selectedCategory, setSelectedCategory] = useState("greetings");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [situationalQuizIndex, setSituationalQuizIndex] = useState(0);
  const [situationalCueIndex, setSituationalCueIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [quizState, setQuizState] = useState({ q: 0, score: 0, answered: null, done: false });
  const [networkView, setNetworkView] = useState("directory");
  const [sinSehDialectFilter, setSinSehDialectFilter] = useState("All");
  const [requestModal, setRequestModal] = useState(null); // { user } when composing a mentorship request
  const [requestMessage, setRequestMessage] = useState("");
  const [connectError, setConnectError] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null); // { id, name } when confirming connection removal
  const [disMode, setDisMode] = useState("cards"); // cards | search
  const [disSearch, setDisSearch] = useState("");
  const [disFilter, setDisFilter] = useState("All");
  const [disCard, setDisCard] = useState(0);
  const [disFlipped, setDisFlipped] = useState(false);
  const [disExpanded, setDisExpanded] = useState(null);
  const [networkFilter, setNetworkFilter] = useState("All");
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", age: "", occupation: "", email: "", languageInterest: "Hokkien", role: "mentee", gender: "", dialectsKnown: [] });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [situationalScore, setSituationalScore] = useState(0);
  const [sentenceScore, setSentenceScore] = useState(0);
  const [completionData, setCompletionData] = useState(null);

  function completeProfile() { return ctxCompleteProfile(profileForm); }
  function saveProfile() { return ctxSaveProfile(profileForm).then(ok => { if (ok) setProfileEditMode(false); }); }
  function handleGoogleSuccess(credentialResponse) {
    return ctxHandleGoogleSuccess(credentialResponse).then(result => {
      if (result?.needsProfile) {
        setProfileForm(f => ({
          ...f,
          firstName: result.googleData.firstName || '',
          lastName: result.googleData.lastName || '',
          email: result.googleData.email || '',
        }));
        setScreen('profile');
      } else if (result?.signedIn) {
        setScreen('home');
      }
    });
  }

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

  const dialect = dialects.find(d => d.id === selectedDialect);

  function restoreProgress(p) {
    if (!p || typeof p !== 'object') return;
    if (p.lastDialect) setSelectedDialect(p.lastDialect);
    if (p.lastCategory) setSelectedCategory(p.lastCategory);
    if (p.lessonMode) setLessonMode(p.lessonMode);
    if (p.cardIndex != null) setCardIndex(p.cardIndex);
    if (p.knownCards) setKnownCards(p.knownCards);
    if (p.completedCategories) setProgress(p.completedCategories);
    if (p.situationalQuizIndex != null) setSituationalQuizIndex(p.situationalQuizIndex);
    if (p.situationalCueIndex != null) setSituationalCueIndex(p.situationalCueIndex);
    if (p.situationalScore != null) setSituationalScore(p.situationalScore);
    if (p.sentenceIndex != null) setSentenceIndex(p.sentenceIndex);
    if (p.sentenceScore != null) setSentenceScore(p.sentenceScore);
  }

  // Speed Round: generate questions from lessons + expanded data + dictionary
  const startSpeedRound = useCallback(() => {
    const allCards = [];
    const cats = ["greetings", "numbers", "food", "verbs", "family", "emotions", "hawker", "travel", "body", "time", "daily_life"];
    for (const cat of cats) {
      const cards = lessons[selectedDialect]?.[cat] || [];
      for (const card of cards) allCards.push(card);
    }
    // Also include expanded flashcard data
    const extraCardsMap = { hokkien: hokkienFlashcards, cantonese: cantoneseFlashcards, teochew: teochewFlashcards, hakka: hakkaFlashcards, hainanese: hainaneseFlashcards };
    const extraCards = extraCardsMap[selectedDialect];
    if (extraCards) {
      for (const cat of cats) {
        const cards = extraCards[cat] || [];
        for (const card of cards) allCards.push(card);
      }
    }
    // Also include dictionary words for this dialect
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
    // Shuffle and pick 20
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
    // Primary source: dictionary words (rich data with IPA, POS, examples)
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
    // Fallback: hardcoded lessons if dictionary is empty
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
    // Primary: dictionary words matching dialect and category
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
    // Fallback: hardcoded lessons
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

  async function loadConnections() {
    if (!currentUser) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const [a, b] = await Promise.all([
        fetch(`/api/connections?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`/api/connections/pending?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setConnections(Array.isArray(a) ? a : []);
      setPendingRequests(Array.isArray(b) ? b : []);
    } catch (e) {
      console.error('Failed to load connections:', e);
    }
  }

  async function sendConnectRequest(targetUserId, message = '') {
    if (!currentUser || currentUser.id === targetUserId) return false;
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requesterId: currentUser.id, receiverId: targetUserId, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setConnectError(data.error || `Request failed (${res.status})`);
        return false;
      }
      await loadConnections();
      return true;
    } catch (e) {
      console.error('Failed to send connect request:', e);
      setConnectError('Network error — please try again');
      return false;
    }
  }

  async function acceptConnectRequest(connectionId) {
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setConnectError(data.error || `Accept failed (${res.status})`);
        return;
      }
      await loadConnections();
    } catch (e) {
      console.error('Failed to accept request:', e);
      setConnectError('Network error — please try again');
    }
  }

  async function rejectConnectRequest(connectionId) {
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setConnectError(data.error || `Action failed (${res.status})`);
        return;
      }
      await loadConnections();
    } catch (e) {
      console.error('Failed to reject request:', e);
      setConnectError('Network error — please try again');
    }
  }

  async function removeConnection(connectionId) {
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setConnectError(data.error || `Remove failed (${res.status})`);
        return;
      }
      setRemoveConfirm(null);
      await loadConnections();
    } catch (e) {
      console.error('Failed to remove connection:', e);
      setConnectError('Network error — please try again');
    }
  }

  function getConnectionStatus(targetId) {
    const accepted = connections.find(c => c.connected_user_id === targetId && c.status === 'accepted');
    if (accepted) return 'accepted';
    const sent = connections.find(c => c.requester_id === currentUser?.id && c.connected_user_id === targetId && c.status === 'pending');
    if (sent) return 'sent';
    const received = pendingRequests.find(r => r.requester_id === targetId);
    if (received) return 'received';
    return 'none';
  }

  function handleLogout() {
    ctxHandleLogout();
    setProfileEditMode(false);
  }

  // Restore screen and dialect from URL on component mount
  useEffect(() => {
    const screenParam = searchParams.get('screen');
    const dialectParam = searchParams.get('dialect');

    if (screenParam && ['home', 'dialect', 'lesson', 'quiz', 'network', 'profile'].includes(screenParam)) {
      setScreen(screenParam);
    }

    if (dialectParam) {
      const found = dialects.find(d => d.id === dialectParam);
      if (found) {
        setSelectedDialect(found.id);
      }
    }
  }, [searchParams]);

  // Sync screen and dialect changes to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (screen !== 'home') {
      params.set('screen', screen);
    }

    if (selectedDialect) {
      params.set('dialect', selectedDialect);
    }

    const query = params.toString();
    const newUrl = query ? `/?${query}` : '/';

    // Only push if URL actually changed
    if (typeof window !== 'undefined') {
      const currentSearch = window.location.search;
      const expectedSearch = query ? `?${query}` : '';
      if (currentSearch !== expectedSearch) {
        router.push(newUrl);
      }
    }
  }, [screen, selectedDialect]);

  // Bootstrap (dictionary fetch, community profiles, session restore) and
  // debounced XP/progress persistence now live in AppProvider (src/components/AppProvider.js).

  // Load connections when entering Network screen
  useEffect(() => {
    if (screen === 'network' && currentUser) loadConnections();
  }, [screen, currentUser?.id]);

  // Save daily completion date when daily challenge is completed

  // Build flashcard deck: hardcoded lessons + dictionary words with full rich data
  const dictForCategory = selectedDialect ? apiWords.filter(w => w.dialect === selectedDialect && (w.tags || []).includes(selectedCategory)) : [];
  const staticCards = (selectedDialect && lessons[selectedDialect]?.[selectedCategory] || []);
  // Convert static cards to rich format (add ipa/examples/pos from dictionary if available)
  const richStatic = staticCards.map(sc => {
    const dictMatch = dictForCategory.find(d => d.headword?.romanized === sc.phrase);
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
  // Convert dictionary words to card format with all rich data
  const dictCards = dictForCategory.filter(d => !staticCards.find(s => s.phrase === d.headword?.romanized)).map(d => ({
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
  const cards = [...richStatic, ...dictCards];

  function selectDialect(id) {
    if (id !== selectedDialect) {
      setSelectedCategory("greetings");
      setCardIndex(0);
    }
    setSelectedDialect(id);
    setFlipped(false);
    setScreen("lesson");
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

  function startQuiz() {
    const allPhrases = Object.values(lessons[selectedDialect]).flat();
    setQuizState({ questions: allPhrases.sort(() => Math.random() - 0.5).slice(0, 5), q: 0, score: 0, answered: null, done: false });
    setScreen("quiz");
  }

  function answerQuiz(choice) {
    const q = quizState.questions[quizState.q];
    const correct = choice === q.meaning;
    const newScore = correct ? quizState.score + 1 : quizState.score;
    setQuizState(s => ({ ...s, answered: choice, score: newScore }));
    setTimeout(() => {
      if (quizState.q + 1 >= quizState.questions.length) {
        setQuizState(s => ({ ...s, done: true, score: newScore }));
      } else {
        setQuizState(s => ({ ...s, q: s.q + 1, answered: null }));
      }
    }, 1000);
  }

  function getQuizOptions(q) {
    const allMeanings = Object.values(lessons[selectedDialect]).flat().map(p => p.meaning);
    const wrong = allMeanings.filter(m => m !== q.meaning).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, q.meaning].sort(() => Math.random() - 0.5);
  }

  const totalProgress = Object.keys(progress).filter(k => k.startsWith(selectedDialect || "")).length;

  return (
    <>
      {/* HOME */}
      {screen === "home" && (
        <div>
          <div className="orbital-wrapper" style={{ background: "linear-gradient(135deg, #1A1208 0%, #2C1810 50%, #3D1F10 100%)" }}>
            {/* Background radial overlays */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(192,57,43,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,134,11,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />

            {/* Desktop: orbital stage */}
            <div className="orbital-stage">
              <div className="orbital-ring" />
              <div className="orbital-center" style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ marginBottom: 12, width: "100%", maxWidth: 200 }}>
                  <Image src="/logo/seal_and_name_transparent.png" alt="tiagong.sg" width={200} height={164} priority style={{ width: "100%", height: "auto" }} />
                </div>
                <p style={{ color: "#E8D4A8", lineHeight: 1.6, marginBottom: 12, fontSize: 15, maxWidth: 320 }}>
                  Singapore's Chinese dialects — Hokkien, Cantonese, Teochew, Hakka, Hainanese — are living bridges to our ancestors.
                </p>
                <p style={{ color: "#E8D4A8", fontSize: 14, fontStyle: "italic", lineHeight: 1.6, maxWidth: 320 }}>
                  每一句方言，都是一条连接过去的线。<br />Every dialect phrase is a thread connecting us to our past.
                </p>
              </div>
              {dialects.map((d, i) => {
                const angle = (-90 + i * 72) * (Math.PI / 180);
                const R = 285;
                const x = Math.round(R * Math.cos(angle));
                const y = Math.round(R * Math.sin(angle));
                const tooltipBelow = y < -150;
                const dialectProgress = Object.keys(progress).filter(k => k.startsWith(d.id)).length;
                return (
                  <div
                    key={d.id}
                    className="orbital-card"
                    onClick={() => selectDialect(d.id)}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      animationDelay: `${0.1 + i * 0.1}s`,
                      "--dialect-glow": `${d.color}99`,
                    }}
                  >
                    <div className={`orbital-tooltip ${tooltipBelow ? "orbital-tooltip-below" : "orbital-tooltip-above"}`}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: d.color, marginBottom: 6 }}>{d.name}</div>
                      <div style={{ fontSize: 14, color: "#E8D4A8", lineHeight: 1.5 }}>{d.description}</div>
                      <div style={{ fontSize: 13, color: "#E8D4A8", marginTop: 8 }}>📍 {d.origin}</div>
                      <div style={{ fontSize: 13, color: "#E8D4A8", marginTop: 2 }}>👥 {d.speakers}</div>
                    </div>
                    <div style={{ fontSize: 34 }}>{d.icon}</div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "#F5E6C8", lineHeight: 1.2 }}>{d.name}</div>
                    <div style={{ fontSize: 18, color: d.color, fontFamily: "var(--font-chinese)" }}>{d.chinese}</div>
                    {dialectProgress > 0 && (
                      <div style={{ width: 36, height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 1, marginTop: 3 }}>
                        <div style={{ width: `${(dialectProgress / 3) * 100}%`, height: "100%", background: d.color, borderRadius: 1 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: stacked layout */}
            <div className="orbital-mobile">
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ marginBottom: 12 }}>
                  <Image src="/logo/seal_and_name_transparent.png" alt="tiagong.sg" width={140} height={114} priority style={{ width: "100%", height: "auto", maxWidth: 140, margin: "0 auto" }} />
                </div>
                <p className="hero-subtext" style={{ color: "#A08060", lineHeight: 1.6, marginBottom: 8, fontSize: 14 }}>
                  Singapore's Chinese dialects — Hokkien, Cantonese, Teochew, Hakka, Hainanese — are living bridges to our ancestors.
                </p>
                <p style={{ color: "#7A6040", fontSize: 13, fontStyle: "italic", marginBottom: 32 }}>
                  每一句方言，都是一条连接过去的线。 · Every dialect phrase is a thread connecting us to our past.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dialects.map((d, i) => {
                  const dialectProgress = Object.keys(progress).filter(k => k.startsWith(d.id)).length;
                  return (
                    <div key={d.id} className="orbital-mobile-card" onClick={() => selectDialect(d.id)}
                      style={{ border: `1px solid ${d.color}44`, animationDelay: `${i * 0.08}s` }}>
                      <div style={{ fontSize: 32 }}>{d.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "#F5E6C8" }}>{d.name}</div>
                        <div style={{ fontSize: 16, color: d.color, fontFamily: "var(--font-chinese)" }}>{d.chinese}</div>
                        <p style={{ fontSize: 13, color: "#8B7355", marginTop: 4, lineHeight: 1.5 }}>{d.description}</p>
                      </div>
                      <div style={{ color: d.color, fontSize: 22, fontWeight: 300 }}>›</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LESSON */}
      {screen === "lesson" && dialect && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

          {/* Dialect Header — compact */}
          <div style={{ background: `linear-gradient(135deg, ${dialect.color}18, ${dialect.color}08)`, border: `1.5px solid ${dialect.color}30`, borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <SealChip dialect={dialect} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "var(--color-text)" }}>{dialect.name}</div>
              <div style={{ fontSize: 18, color: dialect.color, fontFamily: "var(--font-chinese)" }}>{dialect.chinese}</div>
            </div>
            <button className="btn-secondary" onClick={() => setScreen("home")} style={{ fontSize: 13, padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}>
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
            ].map(({ mode, icon: Icon, label, desc }) => (
              <button key={mode} className="tab-btn" onClick={() => {
                setLessonMode(mode);
                setSelectedAnswer(null); setQuizShowResult(false); setCompletionData(null);
                if (mode === "speed-round") startSpeedRound();
                if (mode === "daily-challenge") startDailyChallenge();
                if (mode === "reverse-cards") startReverseCards();
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


              {/* Progress bar */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "#8B7355" }}>
                <span>Card {cardIndex + 1} / {cards.length}</span>
                <span style={{ color: dialect.color, fontWeight: 600 }}>
                  {Object.keys(knownCards).filter(k => k.startsWith(`${selectedDialect}-${selectedCategory}-`)).length} known
                </span>
              </div>
              <div className="progress" style={{ marginBottom: 24 }}>
                <div className="progress-fill" style={{ width: `${((cardIndex + 1) / cards.length) * 100}%`, background: dialect.color }} />
              </div>

              {/* Flashcard */}
              <div className="card-3d flashcard" style={{ marginBottom: 20 }} onClick={() => setFlipped(!flipped)}>
                <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
                  <div className="card-face" style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 14 }}>Tap to reveal meaning</div>
                    <div className="romanized" style={{ fontSize: 44, fontWeight: 700, color: "white", textAlign: "center", padding: "0 24px" }}>
                      {cards[cardIndex]?.phrase}
                    </div>
                    <div style={{ fontFamily: "var(--font-chinese)", fontSize: 26, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
                      {cards[cardIndex]?.chinese}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, fontStyle: "italic" }}>
                      /{cards[cardIndex]?.romanisation}/
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); speak(cards[cardIndex]?.phrase, selectedDialect); }}
                      className="btn-tts"
                      style={{ marginTop: 16, padding: "8px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-pill)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                      <Volume2 size={15} /> Hear it
                    </button>
                  </div>
                  <div className="card-face card-back" style={{ background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", cursor: "pointer", border: `3px solid ${dialect.color}`, borderRadius: 20, padding: "24px 20px", overflowY: "auto" }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#9B8B75", textTransform: "uppercase", marginBottom: 10 }}>Meaning</div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "#1A1208", textAlign: "center", padding: "0 12px" }}>
                      {cards[cardIndex]?.meaning}
                    </div>
                    <div style={{ fontSize: 14, color: dialect.color, marginTop: 8, fontWeight: 600 }}>
                      {cards[cardIndex]?.romanisation}
                    </div>
                    <div style={{ fontFamily: "var(--font-chinese)", fontSize: 18, color: "#8B7355", marginTop: 4 }}>
                      {cards[cardIndex]?.chinese}
                    </div>
                    {cards[cardIndex]?.ipa && (
                      <div style={{ fontSize: 13, color: "#9B8B75", marginTop: 8, fontStyle: "italic" }}>
                        {cards[cardIndex]?.ipa}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                      {cards[cardIndex]?.pos && (
                        <span style={{ fontSize: 10, background: "#F0E8DA", color: "#8B7355", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>{cards[cardIndex]?.pos}</span>
                      )}
                      {cards[cardIndex]?.frequency && (
                        <span style={{ fontSize: 10, background: cards[cardIndex]?.frequency === 'very_common' ? "#EAFAF1" : "#FEF9E7", color: cards[cardIndex]?.frequency === 'very_common' ? "#1A6B3C" : "#D4860B", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>{cards[cardIndex]?.frequency}</span>
                      )}
                    </div>
                    {cards[cardIndex]?.examples && cards[cardIndex]?.examples.length > 0 && (
                      <div style={{ marginTop: 10, width: "100%" }}>
                        <div style={{ fontSize: 10, color: "#9B8B75", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Example</div>
                        {cards[cardIndex].examples.slice(0, 2).map((ex, i) => (
                          <div key={i} style={{ background: "#FAF6F0", borderRadius: 8, padding: "8px 12px", marginBottom: 4, fontSize: 12, color: "#1A1208", borderLeft: `3px solid ${dialect.color}` }}>
                            <div style={{ fontStyle: "italic" }}>"{ex.text_source_lang}"</div>
                            <div style={{ color: "#8B7355", marginTop: 2 }}>{ex.text_target_lang}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); speak(cards[cardIndex]?.phrase, selectedDialect); }}
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
                    {cardIndex < cards.length - 1 ? "Next <ArrowRight size={15} />" : "<Repeat size={15} /> Restart"}
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
                        {situationalScore} / {situationalCueIndex} ✓
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
                            <button onClick={(e) => { e.stopPropagation(); speak(dialogue.phrase, selectedDialect); }}
                              className="btn-tts"
                              style={{ marginTop: 6, padding: "4px 12px", background: `${dialect.color}10`, border: `1px solid ${dialect.color}30`, borderRadius: 12, color: dialect.color, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Volume2 size={15} /> Hear
                            </button>
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
                        {situationalCueIndex < quiz.cues.length - 1 ? "Next Scene <ArrowRight size={15} />" : situationalQuizIndex < quizzes.length - 1 ? "Next Story <ArrowRight size={15} />" : "View Results <ArrowRight size={15} />"}
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
                const exercises = sentenceCompletion[selectedDialect] || [];
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
                        {sentenceScore} / {sentenceIndex} ✓
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="progress" style={{ marginBottom: 24 }}>
                      <div className="progress-fill" style={{ width: `${(sentenceIndex / exercises.length) * 100}%`, background: dialect.color }} />
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
                        {sentenceIndex < exercises.length - 1 ? "Next <ArrowRight size={15} />" : "View Results <ArrowRight size={15} />"}
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
                        {dailyIndex < dailyQuestions.length - 1 ? "Next <ArrowRight size={15} />" : "View Results <ArrowRight size={15} />"}
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
                          {reverseIndex < reverseCards.length - 1 ? "Next <ArrowRight size={15} />" : "<Repeat size={15} /> Restart"}
                        </button>
                      </div>
                    )}
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
      )}

      {/* QUIZ */}
      {screen === "quiz" && dialect && quizState.questions && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 700, color: "#1A1208" }}>
              {dialect.icon} {dialect.name} Quiz
            </div>
          </div>

          {!quizState.done ? (
            <div className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 14, color: "#8B7355" }}>
                <span>Question {quizState.q + 1} / {quizState.questions.length}</span>
                <span style={{ color: dialect.color, fontWeight: 600 }}>Score: {quizState.score}</span>
              </div>
              <div className="progress" style={{ marginBottom: 32 }}>
                <div className="progress-fill" style={{ width: `${((quizState.q + 1) / quizState.questions.length) * 100}%`, background: dialect.color }} />
              </div>

              <div style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, borderRadius: 20, padding: 40, textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>WHAT DOES THIS MEAN?</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 44, fontWeight: 700, color: "white" }}>
                  {quizState.questions[quizState.q]?.phrase}
                </div>
                <div style={{ fontFamily: "var(--font-chinese)", fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
                  {quizState.questions[quizState.q]?.chinese}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {getQuizOptions(quizState.questions[quizState.q]).map((opt, i) => {
                  const isCorrect = opt === quizState.questions[quizState.q].meaning;
                  const isSelected = opt === quizState.answered;
                  let bg = "white", border = "#E8DDD0", color = "#1A1208";
                  if (quizState.answered) {
                    if (isCorrect) { bg = "#EAFAF1"; border = "#27AE60"; color = "#1A6B3C"; }
                    else if (isSelected) { bg = "#FDEDEC"; border = "#E74C3C"; color = "#C0392B"; }
                  }
                  return (
                    <button key={i} className="btn-hover" onClick={() => !quizState.answered && answerQuiz(opt)}
                      style={{ padding: "16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, fontSize: 15, cursor: quizState.answered ? "default" : "pointer", color, fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
                      {isCorrect && quizState.answered ? "✓ " : isSelected && !isCorrect ? "✗ " : ""}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }} className="fade-up">
              <div style={{ fontSize: 72, marginBottom: 16 }}>{quizState.score >= 4 ? <Trophy size={56} /> : quizState.score >= 2 ? <ThumbsUp size={56} /> : <BookOpen size={56} />}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 48, fontWeight: 700, color: "#1A1208", marginBottom: 8 }}>
                {quizState.score} / {quizState.questions.length}
              </div>
              <div style={{ fontSize: 18, color: "#8B7355", marginBottom: 8, fontStyle: "italic" }}>
                {quizState.score >= 4 ? "Excellent! 做得好！" : quizState.score >= 2 ? "Good effort! Keep practising!" : "Keep learning! 继续加油！"}
              </div>
              <div style={{ background: "#F5E6C8", borderRadius: 16, padding: 24, margin: "24px 0", borderLeft: `4px solid ${dialect.color}` }}>
                <div style={{ fontSize: 14, color: "#6B5B45", lineHeight: 1.7 }}>
                  Every dialect phrase you learn is a step toward preserving Singapore's rich cultural heritage. Share what you've learned with your grandparents — they'll be delighted!
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn-hover" onClick={startQuiz}
                  style={{ background: dialect.color, color: "white", border: "none", padding: "14px 28px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  Retry Quiz
                </button>
                <button className="btn-hover" onClick={() => setScreen("lesson")}
                  style={{ background: "white", color: "#1A1208", border: "2px solid #E8DDD0", padding: "14px 28px", borderRadius: 10, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  Back to Lessons
                </button>
              </div>
            </div>
          )}
        </div>
      )}



      {screen === "network" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Community</div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 48, color: "#1A1208", marginBottom: 12 }}>Network</h1>
            <p style={{ color: "#8B7355", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>Connect with fellow learners and Sin Sehs (mentors) across Singapore. Keep our dialects alive together.</p>
          </div>

          {/* Main view toggle */}
          <div className="pill-toggle" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
            {[["directory", "Find a Sin Seh"], ["mentorships", "My Mentorships"], ["everyone", "Everyone"]].map(([view, label]) => (
              <button key={view} onClick={() => setNetworkView(view)} className={networkView === view ? "active" : ""}
                style={{ padding: "11px 24px", borderRadius: 10, background: networkView === view ? "#C0392B" : "white", color: networkView === view ? "white" : "#6B5B45", fontSize: 14, border: "2px solid " + (networkView === view ? "#C0392B" : "#E8DDD0"), fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {label}
                {view === "mentorships" && pendingRequests.length > 0 && (
                  <span style={{ marginLeft: 8, background: networkView === view ? "rgba(255,255,255,0.3)" : "#C0392B", color: "white", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {networkView === "directory" && (
            <div>
              {/* Request modal overlay */}
              {requestModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24 }}>
                      <div style={{ fontSize: 36 }}>{requestModal.avatar}</div>
                      <div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208" }}>Request {requestModal.firstName}</div>
                        <div style={{ fontSize: 13, color: "#9B8B75" }}>Sin Seh · {requestModal.languageInterest}</div>
                      </div>
                    </div>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Introduction (optional)</label>
                    <textarea
                      value={requestMessage}
                      onChange={e => setRequestMessage(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Tell this Sin Seh a little about yourself and why you want to learn..."
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 14, fontFamily: "inherit", background: "#FAF6F0", resize: "vertical", marginBottom: 20 }}
                    />
                    {connectError && (
                      <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #C0392B40" }}>
                        {connectError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => { setRequestModal(null); setRequestMessage(""); setConnectError(null); }}
                        style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                        Cancel
                      </button>
                      <button onClick={async () => { const ok = await sendConnectRequest(requestModal.id, requestMessage); if (ok) { setRequestModal(null); setRequestMessage(""); } }}
                        style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Send Request
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Hero banner */}
              <div style={{ background: "linear-gradient(135deg, #2C1508, #4A1F10)", borderRadius: 20, padding: "36px 32px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:16, color:"var(--color-primary)" }}><GraduationCap size={48} /></div>
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 700, color: "#F5E6C8" }}>Sin Seh <span style={{ fontStyle: "italic", color: "#C0392B" }}>先生</span></div>
                  <div style={{ fontSize: 14, color: "#A08060", marginTop: 4, marginBottom: 8 }}>Mentorship Programme · Completely Free</div>
                  <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>Connect with native speakers who give their time freely. Find a mentor for your dialect journey below.</p>
                </div>
              </div>

              {/* Role-aware CTA */}
              {!currentUser ? (
                <div style={{ background: "#FAF6F0", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px dashed #D4C9B8" }}>
                  <div style={{ fontSize: 14, color: "#8B7355" }}>Register your profile to access mentorship features.</div>
                  <button onClick={() => setScreen("profile")} className="btn-hover"
                    style={{ padding: "10px 20px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Register Profile
                  </button>
                </div>
              ) : (currentUser.role === "mentor" || currentUser.role === "both") ? (
                <div style={{ background: "#FEF3E2", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #D4860B40" }}>
                  <span style={{ display:"inline-flex", color:"var(--color-primary)" }}><UserCheck size={20} /></span>
                  <div style={{ fontSize: 14, color: "#8B6020" }}>You are a <strong>Sin Seh</strong>. Mentees can find you here. Check <em>My Mentorships</em> to respond to requests.</div>
                </div>
              ) : (
                <div style={{ background: "#EEF2FF", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #5B21B640" }}>
                  <span style={{ fontSize: 20 }}><GraduationCap size={20} /></span>
                  <div style={{ fontSize: 14, color: "#3B1D8A" }}>Browse Sin Sehs below and send a mentorship request. Once accepted, their contact will be revealed.</div>
                </div>
              )}

              {/* Dialect filter pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                {["All", "Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(f => (
                  <button key={f} onClick={() => setSinSehDialectFilter(f)} className={sinSehDialectFilter === f ? "active" : ""}
                    style={{ padding: "7px 16px", borderRadius: 20, background: sinSehDialectFilter === f ? "#C0392B" : "white", color: sinSehDialectFilter === f ? "white" : "#6B5B45", fontSize: 13, border: "1px solid " + (sinSehDialectFilter === f ? "#C0392B" : "#E8DDD0"), fontWeight: sinSehDialectFilter === f ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                    {f}
                  </button>
                ))}
              </div>

              {connectError && (
                <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 10, padding: "12px 16px", fontSize: 13, border: "1px solid #C0392B40", marginBottom: 20 }}>
                  {connectError}
                </div>
              )}

              {(() => {
                const sinSehs = registeredUsers.filter(u => (u.role === "mentor" || u.role === "both") && u.id !== currentUser?.id);
                const filtered = sinSehDialectFilter === "All" ? sinSehs : sinSehs.filter(u => u.languageInterest === sinSehDialectFilter);
                const dColors = { Hokkien: "#C0392B", Cantonese: "#8E44AD", Teochew: "#1A6B3C", Hakka: "#D4860B", Hainanese: "#1A7EA6" };

                // Sort: dialect-match first
                const sorted = filtered.sort((a, b) => {
                  const aMatches = currentUser?.languageInterest === a.languageInterest;
                  const bMatches = currentUser?.languageInterest === b.languageInterest;
                  return bMatches - aMatches;
                });

                return filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:16, color:"var(--color-primary)" }}><UserCheck size={40} /></div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No Sin Sehs yet</div>
                    <p style={{ fontSize: 14 }}>{sinSehDialectFilter !== "All" ? `No mentors available for ${sinSehDialectFilter} yet.` : "Be the first — set your role to Mentor in your Profile."}</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                    {sorted.map(m => {
                      const dialectColor = dColors[m.languageInterest] || "#8B7355";
                      const status = currentUser ? getConnectionStatus(m.id) : 'none';
                      const isDialectMatch = currentUser?.languageInterest === m.languageInterest;
                      return (
                        <div key={m.id} className="card" style={{ padding: 28, position: "relative" }}>
                          {isDialectMatch && currentUser && (
                            <div style={{ position: "absolute", top: 12, right: 12, fontSize: 11, background: "#1A6B3C", color: "white", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                              Matches your dialect ✓
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                            <div style={{ fontSize: 44, background: "#FAF6F0", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.avatar}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 17, color: "#1A1208" }}>{m.firstName} {m.lastName}</div>
                              <div style={{ fontSize: 12, color: "#9B8B75" }}>Age {m.age} · {m.occupation}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, background: dialectColor + "18", color: dialectColor, padding: "4px 12px", borderRadius: 12, fontWeight: 600 }}>{m.languageInterest}</span>
                            <span style={{ fontSize: 11, background: "#FEF3E2", color: "#D4860B", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>Sin Seh</span>
                          </div>
                          {status === 'accepted' ? (
                            <div style={{ padding: "12px 14px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600 }}>
                              Connected · <a href={buildIntroEmailUrl(currentUser, m)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 400, color: "#1A6B3C", textDecoration: "underline" }}>{m.email}</a>
                            </div>
                          ) : status === 'sent' ? (
                            <div style={{ padding: "12px", borderRadius: 10, background: "#FEF3E2", color: "#D4860B", fontSize: 13, fontWeight: 600, textAlign: "center", border: "1px solid #D4860B40" }}>
                              Request Sent ✓
                            </div>
                          ) : status === 'received' ? (
                            <button className="btn-hover" onClick={() => setNetworkView("mentorships")}
                              style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#5B21B6", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              Respond to their request <ArrowRight size={15} />
                            </button>
                          ) : !currentUser ? (
                            <button className="btn-hover" onClick={() => setScreen("profile")}
                              style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#F5F0EA", color: "#8B7355", border: "1px dashed #D4C9B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                              Register to Connect
                            </button>
                          ) : (
                            <button className="btn-hover" onClick={() => { setRequestModal(m); setRequestMessage(""); }}
                              style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              Request Mentorship
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {networkView === "mentorships" && (
            <div style={{ position: "relative" }}>
              {/* Request modal overlay */}
              {requestModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24 }}>
                      <div style={{ fontSize: 36 }}>{requestModal.avatar}</div>
                      <div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208" }}>Request {requestModal.firstName}</div>
                        <div style={{ fontSize: 13, color: "#9B8B75" }}>Sin Seh · {requestModal.languageInterest}</div>
                      </div>
                    </div>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Introduction (optional)</label>
                    <textarea
                      value={requestMessage}
                      onChange={e => setRequestMessage(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Tell this Sin Seh a little about yourself and why you want to learn..."
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 14, fontFamily: "inherit", background: "#FAF6F0", resize: "vertical", marginBottom: 20 }}
                    />
                    {connectError && (
                      <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #C0392B40" }}>
                        {connectError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => { setRequestModal(null); setRequestMessage(""); setConnectError(null); }}
                        style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                        Cancel
                      </button>
                      <button onClick={async () => { const ok = await sendConnectRequest(requestModal.id, requestMessage); if (ok) { setRequestModal(null); setRequestMessage(""); } }}
                        style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Send Request
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {removeConfirm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 12 }}>Remove Connection?</div>
                    <p style={{ fontSize: 14, color: "#6B5B45", marginBottom: 24, lineHeight: 1.6 }}>
                      This will disconnect you from <strong>{removeConfirm.name}</strong>. You can always send a new connection request later.
                    </p>
                    {connectError && (
                      <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #C0392B40" }}>
                        {connectError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => setRemoveConfirm(null)}
                        style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                        Cancel
                      </button>
                      <button onClick={() => removeConnection(removeConfirm.id)}
                        style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Hero banner */}
              <div style={{ background: "linear-gradient(135deg, #2C1508, #4A1F10)", borderRadius: 20, padding: "36px 32px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:16, color:"var(--color-primary)" }}><GraduationCap size={48} /></div>
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 700, color: "#F5E6C8" }}>Sin Seh <span style={{ fontStyle: "italic", color: "#C0392B" }}>先生</span></div>
                  <div style={{ fontSize: 14, color: "#A08060", marginTop: 4, marginBottom: 8 }}>Mentorship Programme · Completely Free</div>
                  <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>Connect with native speakers who give their time freely. Set your role in your Profile, then find a Sin Seh or manage your mentees here.</p>
                </div>
              </div>

              {/* Role-aware CTA banner */}
              {!currentUser ? (
                <div style={{ background: "#FAF6F0", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px dashed #D4C9B8" }}>
                  <div style={{ fontSize: 14, color: "#8B7355" }}>Register your profile to access mentorship features.</div>
                  <button onClick={() => setScreen("profile")} className="btn-hover"
                    style={{ padding: "10px 20px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Register Profile
                  </button>
                </div>
              ) : (currentUser.role === "mentor" || currentUser.role === "both") ? (
                <div style={{ background: "#FEF3E2", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #D4860B40" }}>
                  <span style={{ display:"inline-flex", color:"var(--color-primary)" }}><UserCheck size={20} /></span>
                  <div style={{ fontSize: 14, color: "#8B6020" }}>You are a <strong>Sin Seh</strong>. Mentees can find you in the directory. Check <em>My Mentorships</em> to respond to requests.</div>
                </div>
              ) : (
                <div style={{ background: "#EEF2FF", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #5B21B640" }}>
                  <span style={{ fontSize: 20 }}><GraduationCap size={20} /></span>
                  <div style={{ fontSize: 14, color: "#3B1D8A" }}>Browse Sin Sehs below and send a mentorship request. Once accepted, their contact will be revealed.</div>
                </div>
              )}
            </div>
          )}

          {networkView === "mentorships" && (
            <div>
              {/* Remove modal overlay */}
              {removeConfirm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 12 }}>Remove Connection?</div>
                    <p style={{ fontSize: 14, color: "#6B5B45", marginBottom: 24, lineHeight: 1.6 }}>
                      This will disconnect you from <strong>{removeConfirm.name}</strong>. You can always send a new connection request later.
                    </p>
                    {connectError && (
                      <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #C0392B40" }}>
                        {connectError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => setRemoveConfirm(null)}
                        style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                        Cancel
                      </button>
                      <button onClick={() => removeConnection(removeConfirm.id)}
                        style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(() => {
                const dColors = { Hokkien: "#C0392B", Cantonese: "#8E44AD", Teochew: "#1A6B3C", Hakka: "#D4860B", Hainanese: "#1A7EA6" };
                const incoming = pendingRequests;
                const sent = connections.filter(c => c.requester_id === currentUser?.id && c.status === 'pending');
                const active = connections.filter(c => c.status === 'accepted');
                const hasAny = incoming.length > 0 || sent.length > 0 || active.length > 0;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                    {currentUser && (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => loadConnections()} className="btn-hover"
                          style={{ fontSize: 12, color: "#8B7355", background: "transparent", border: "1px solid #E8DDD0", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                          <Repeat size={14} /> Refresh
                        </button>
                      </div>
                    )}
                    {connectError && (
                      <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 10, padding: "12px 16px", fontSize: 13, border: "1px solid #C0392B40" }}>
                        {connectError}
                      </div>
                    )}
                    {!currentUser ? (
                      <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}><Handshake size={40} /></div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208" }}>Sign in to view your mentorships</div>
                      </div>
                    ) : !hasAny ? (
                      <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}><Sprout size={40} /></div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No mentorships yet</div>
                        <p style={{ fontSize: 14, marginBottom: 24 }}>Browse Sin Sehs and send a request to get started.</p>
                        <button onClick={() => setNetworkView("directory")} className="btn-hover"
                          style={{ background: "#C0392B", color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                          Find a Sin Seh
                        </button>
                      </div>
                    ) : (
                      <>
                        {incoming.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, letterSpacing: 3, color: "#C0392B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Incoming Requests ({incoming.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {incoming.map(r => {
                                const dialectColor = dColors[r.language_interest] || "#8B7355";
                                return (
                                  <div key={r.id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                      <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{r.first_name} {r.last_name}</div>
                                      <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 8 }}>Age {r.age} · {r.occupation}</div>
                                      <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{r.language_interest}</span>
                                      <span style={{ fontSize: 11, background: "#EEF2FF", color: "#5B21B6", padding: "3px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize", marginLeft: 6 }}>{r.role}</span>
                                      {r.message && (
                                        <div style={{ marginTop: 10, fontSize: 13, color: "#6B5B45", fontStyle: "italic", background: "#FAF6F0", borderRadius: 8, padding: "8px 12px" }}>"{r.message}"</div>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                      <button onClick={() => rejectConnectRequest(r.id)} className="btn-hover"
                                        style={{ padding: "10px 18px", borderRadius: 10, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                        Decline
                                      </button>
                                      <button onClick={() => acceptConnectRequest(r.id)} className="btn-hover"
                                        style={{ padding: "10px 18px", borderRadius: 10, background: "#1A6B3C", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                        Accept
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {sent.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Sent Requests ({sent.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {sent.map(c => (
                                <div key={c.id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: "#FEF9F0", borderColor: "#D4860B30" }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{c.connected_user_name}</div>
                                    <span style={{ fontSize: 11, background: "#FEF3E2", color: "#D4860B", padding: "3px 8px", borderRadius: 8, fontWeight: 700 }}>Sin Seh · {c.connected_user_dialect}</span>
                                    {c.message && <div style={{ marginTop: 8, fontSize: 13, color: "#6B5B45", fontStyle: "italic" }}>"{c.message}"</div>}
                                  </div>
                                  <div style={{ fontSize: 13, color: "#D4860B", fontWeight: 600 }}>Awaiting response…</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {active.length > 0 && (() => {
                          const isValidMentorship = (c) => {
                            if (currentUser.role === 'mentor') return c.connected_user_role !== 'mentor';
                            if (currentUser.role === 'mentee') return c.connected_user_role !== 'mentee';
                            if (currentUser.role === 'both') return c.connected_user_role !== 'none';
                            return false;
                          };
                          const validMentorships = active.filter(isValidMentorship);
                          const lapsedMentorships = active.filter(c => !isValidMentorship(c));
                          return (
                            <>
                              {validMentorships.length > 0 && (
                                <div>
                                  <div style={{ fontSize: 11, letterSpacing: 3, color: "#1A6B3C", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Active Mentorships ({validMentorships.length})</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                                    {validMentorships.map(c => {
                                      const dialectColor = dColors[c.connected_user_dialect] || "#8B7355";
                                      return (
                                        <div key={c.id} className="card" style={{ padding: 24 }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                            <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{c.connected_user_name}</div>
                                            <span style={{ fontSize: 11, background: c.connected_user_role === "mentor" ? "#FEF3E2" : "#EEF2FF", color: c.connected_user_role === "mentor" ? "#D4860B" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                                              {c.connected_user_role}
                                            </span>
                                          </div>
                                          {c.connected_user_dialect && (
                                            <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>{c.connected_user_dialect}</span>
                                          )}
                                          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600, marginBottom: 8 }}>
                                            {c.connected_user_email}
                                          </div>
                                          <button onClick={() => setRemoveConfirm({ id: c.id, name: c.connected_user_name })} className="btn-hover"
                                            style={{ width: "100%", padding: "8px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                            Remove Connection
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {lapsedMentorships.length > 0 && (
                                <div>
                                  <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Lapsed Mentorships ({lapsedMentorships.length})</div>
                                  <div style={{ background: "#FEF9F0", borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 12, color: "#8B7355", border: "1px solid #D4860B30" }}>
                                    These connections no longer match your current role — both of you may now have the same role. You can remove them below.
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                                    {lapsedMentorships.map(c => {
                                      const dialectColor = dColors[c.connected_user_dialect] || "#8B7355";
                                      return (
                                        <div key={c.id} className="card" style={{ padding: 24, opacity: 0.7 }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                            <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{c.connected_user_name}</div>
                                            <span style={{ fontSize: 11, background: c.connected_user_role === "mentor" ? "#FEF3E2" : "#EEF2FF", color: c.connected_user_role === "mentor" ? "#D4860B" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                                              {c.connected_user_role}
                                            </span>
                                          </div>
                                          {c.connected_user_dialect && (
                                            <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>{c.connected_user_dialect}</span>
                                          )}
                                          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#F5F0EA", border: "1px solid #E8DDD0", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>
                                            {c.connected_user_email}
                                          </div>
                                          <button onClick={() => setRemoveConfirm({ id: c.id, name: c.connected_user_name })} className="btn-hover"
                                            style={{ width: "100%", padding: "8px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                            Remove Connection
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {networkView === "everyone" && (
            <div>
              {connectError && (
                <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 10, padding: "12px 16px", fontSize: 13, border: "1px solid #C0392B40", marginBottom: 20 }}>
                  {connectError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
                {["All", "Mentor", "Mentee"].map(f => (
                  <button key={f} className="pill-toggle" onClick={() => setNetworkFilter(f)}
                    style={{ padding: "8px 16px", borderRadius: 20, background: networkFilter === f ? "#C0392B" : "white", color: networkFilter === f ? "white" : "#6B5B45", fontSize: 13, border: "1px solid " + (networkFilter === f ? "#C0392B" : "#E8DDD0"), fontWeight: networkFilter === f ? 600 : 400, cursor: "pointer" }}>
                    {f}
                  </button>
                ))}
              </div>

              {registeredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:16, color:"var(--color-primary)" }}><Sprout size={40} /></div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No members yet</div>
                  <p style={{ fontSize: 14 }}>Be the first to join the community and connect with fellow dialect learners.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {registeredUsers
                    .filter(m => networkFilter === "All" || m.role === networkFilter.toLowerCase())
                    .map(m => {
                      const dColors = { Hokkien: "#C0392B", Cantonese: "#8E44AD", Teochew: "#1A6B3C", Hakka: "#D4860B", Hainanese: "#1A7EA6" };
                      const isCurrentUser = currentUser?.id === m.id;
                      const connStatus = currentUser ? getConnectionStatus(m.id) : 'none';
                      const dialectColor = dColors[m.languageInterest] || "#8B7355";
                      return (
                        <div key={m.id} className="card" style={{ padding: 24 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div style={{ fontSize: 40, background: "#FAF6F0", borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.avatar}</div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{m.firstName} {m.lastName}</div>
                                <div style={{ fontSize: 12, color: "#9B8B75" }}>Age {m.age} · {m.occupation}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 11, background: m.role === "mentor" ? "#FEF3E2" : m.role === "both" ? "#E8D5F2" : m.role === "none" ? "#F0E8DA" : "#EEF2FF", color: m.role === "mentor" ? "#D4860B" : m.role === "both" ? "#6B21A8" : m.role === "none" ? "#6B5B45" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                              {m.role}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                            <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{m.languageInterest || "—"}</span>
                          </div>
                          {connStatus === 'accepted' ? (
                            <div style={{ marginTop: 4, padding: "10px 14px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600 }}>
                              Connected · <a href={buildIntroEmailUrl(currentUser, m)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 400, color: "#1A6B3C", textDecoration: "underline" }}>{m.email}</a>
                            </div>
                          ) : isCurrentUser ? (
                            <div style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#F5F0EA", color: "#9B8B75", fontSize: 13, textAlign: "center" }}>
                              This is you
                            </div>
                          ) : !currentUser ? (
                            <button className="btn-hover" onClick={() => setScreen("profile")}
                              style={{ marginTop: 4, width: "100%", padding: "10px", borderRadius: 10, background: "#F5F0EA", color: "#8B7355", border: "1px dashed #D4C9B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                              Register to Connect
                            </button>
                          ) : connStatus === 'sent' ? (
                            <div style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#FEF3E2", color: "#D4860B", fontSize: 13, fontWeight: 600, textAlign: "center", border: "1px solid #D4860B40" }}>
                              Request Sent ✓
                            </div>
                          ) : connStatus === 'received' ? (
                            <button className="btn-hover" onClick={() => setNetworkView("mentorships")}
                              style={{ marginTop: 4, width: "100%", padding: "10px", borderRadius: 10, background: "#5B21B6", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              Respond to their request <ArrowRight size={15} />
                            </button>
                          ) : (
                            <button className="btn-hover" onClick={() => sendConnectRequest(m.id)}
                              style={{ marginTop: 4, width: "100%", padding: "10px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              Send Connect Request
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {screen === "profile" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
          {currentUser ? (
            <div className="fade-up">
              {profileEditMode ? (
                <div className="card" style={{ padding: 32 }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 20 }}>Edit Profile</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[["First Name", "text", profileForm.firstName, v => setProfileForm(f => ({ ...f, firstName: v }))],
                      ["Last Name", "text", profileForm.lastName, v => setProfileForm(f => ({ ...f, lastName: v }))]].map(([label, type, val, setter]) => (
                      <div key={label}>
                        <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                        <input className="input" type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label} />
                      </div>
                    ))}
                  </div>

                  {[["Age", "number", profileForm.age, v => setProfileForm(f => ({ ...f, age: v }))],
                    ["Occupation", "text", profileForm.occupation, v => setProfileForm(f => ({ ...f, occupation: v }))]].map(([label, type, val, setter]) => (
                    <div key={label} style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                      <input className="input" type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label} />
                    </div>
                  ))}

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Dialect Interest (Optional)</label>
                    <select value={profileForm.languageInterest} onChange={e => setProfileForm(f => ({ ...f, languageInterest: e.target.value }))} className="input"
                      style={{ height: 44 }}>
                      <option value="">—  Not interested in learning</option>
                      {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Dialects I already know</label>
                    <div className="pill-toggle" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(d => {
                        const checked = (profileForm.dialectsKnown || []).includes(d);
                        return (
                          <button key={d} type="button"
                            onClick={() => setProfileForm(f => ({
                              ...f,
                              dialectsKnown: checked
                                ? f.dialectsKnown.filter(x => x !== d)
                                : [...(f.dialectsKnown || []), d],
                            }))}
                            className={checked ? "active" : ""}
                            style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid " + (checked ? "#C0392B" : "#E8DDD0"), background: checked ? "#FDF0EF" : "white", color: checked ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                            {checked ? "✓ " : ""}{d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>My gender</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[["male", Mars, "Male"], ["female", Venus, "Female"]].map(([val, icon, label]) => (
                        <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, gender: val }))}
                          style={{ flex: 1, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (profileForm.gender === val ? "#C0392B" : "#E8DDD0"), background: profileForm.gender === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                          <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: profileForm.gender === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>I am a</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {[["mentee", "Mentee", "Learn dialects"], ["mentor", "Mentor", "Teach as a Sin Seh"], ["both", "Both", "Learn & teach"], ["none", "Observer", "Just exploring"]].map(([val, label, sub]) => {
                        const emoji = val === "both" || val === "none" ? "👤" : getAvatar(profileForm.gender, val);
                        return (
                          <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, role: val }))}
                            style={{ flex: 1, minWidth: 120, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (profileForm.role === val ? "#C0392B" : "#E8DDD0"), background: profileForm.role === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                            <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: profileForm.role === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                            <div style={{ fontSize: 11, color: "#9B8B75", marginTop: 2 }}>{sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn-primary" onClick={saveProfile} style={{ flex: 1 }}>
                      Save Changes
                    </button>
                    <button className="btn-secondary" onClick={() => { setProfileEditMode(false); setAuthError(null); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {(() => {
                    const level = getLevel(xp);
                    const nextLevel = getNextLevel(xp);
                    const progress = getLevelProgress(xp);
                    const dialectObj = currentUser.languageInterest ? dialects.find(d => d.name === currentUser.languageInterest) : null;
                    const ringColor = dialectObj?.color || "#C0392B";

                    return (
                      <>
                        {/* Identity Header */}
                        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
                            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", background: ringColor + "20", border: "3px solid " + ringColor }}></div>
                              <div style={{ fontSize: 56, zIndex: 1 }}>{currentUser.avatar}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 2 }}>{currentUser.firstName} {currentUser.lastName}</div>
                              <div style={{ fontSize: 14, color: "#8B7355", marginBottom: 12 }}>{currentUser.occupation}{currentUser.age ? ` · Age ${currentUser.age}` : ""}</div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                                {level && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: level.color + "20", color: level.color, fontWeight: 700, fontSize: 12 }}>
                                    <span>{level.icon}</span>{level.name}
                                  </div>
                                )}
                                <div style={{ fontSize: 11, background: currentUser.role === "mentor" ? "#FEF3E2" : currentUser.role === "both" ? "#E8D5F2" : currentUser.role === "none" ? "#F0E8DA" : "#EEF2FF", color: currentUser.role === "mentor" ? "#D4860B" : currentUser.role === "both" ? "#6B21A8" : currentUser.role === "none" ? "#6B5B45" : "#5B21B6", padding: "4px 10px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>{currentUser.role}</div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-secondary" onClick={() => {
                              setProfileForm({
                                firstName: currentUser.firstName || '',
                                lastName: currentUser.lastName || '',
                                age: currentUser.age || '',
                                occupation: currentUser.occupation || '',
                                email: currentUser.email || '',
                                languageInterest: currentUser.languageInterest || '',
                                gender: currentUser.gender || '',
                                role: currentUser.role || 'mentee',
                                dialectsKnown: currentUser.dialectsKnown || [],
                              });
                              setProfileEditMode(true);
                            }} style={{ flex: 1 }}>
                              Edit Profile
                            </button>
                            <button className="btn-ghost" onClick={handleLogout} style={{ flex: 1 }}>
                              Sign Out
                            </button>
                          </div>
                        </div>

                        {/* Learning Journey */}
                        {currentUser.languageInterest && (
                          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                            <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Learning Journey</div>
                            {nextLevel ? (
                              <>
                                <div style={{ marginBottom: 12 }}>
                                  <div style={{ fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>
                                    Progress to {nextLevel.name}
                                  </div>
                                  <div className="progress" style={{ height: 8 }}>
                                    <div className="progress-fill" style={{ width: progress + "%", background: level?.color || "#C0392B" }}></div>
                                  </div>
                                  <div style={{ fontSize: 12, color: "#9B8B75", marginTop: 6 }}>
                                    {xp} XP · {nextLevel.minXP - xp} XP to {nextLevel.name}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 600 }}>Max level reached!</div>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                              <div style={{ background: "#FAF6F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "#6B5B45", marginBottom: 4 }}>Streak</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "#C0392B" }}>
                                  🔥 {streak}
                                </div>
                              </div>
                              <div style={{ background: "#FAF6F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "#6B5B45", marginBottom: 4 }}>Total XP</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1208" }}>{xp}</div>
                              </div>
                              <div style={{ background: "#FAF6F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "#6B5B45", marginBottom: 4 }}>Dialects</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1208" }}>{(currentUser.dialectsKnown || []).length}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* My Dialects */}
                        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                          <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>My Dialects</div>

                          {currentUser.languageInterest && (
                            <div style={{ marginBottom: 20 }}>
                              <div style={{ fontSize: 12, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Currently Learning</div>
                              {dialectObj && <SealChip dialect={dialectObj} size="md" />}
                              <button className="btn-primary" onClick={() => selectDialect(dialectObj?.id)} style={{ marginTop: 12, width: "100%", fontSize: 13 }}>
                                Continue Learning
                              </button>
                            </div>
                          )}

                          <div>
                            <div style={{ fontSize: 12, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Heritage — Dialects I Know</div>
                            {(currentUser.dialectsKnown || []).length > 0 ? (
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {currentUser.dialectsKnown.map(d => {
                                  const dObj = dialects.find(x => x.name === d);
                                  return dObj ? <SealChip key={d} dialect={dObj} size="md" /> : null;
                                })}
                              </div>
                            ) : (
                              <div style={{ fontSize: 13, color: "#9B8B75", fontStyle: "italic" }}>
                                Add dialects you know in your profile to celebrate your heritage.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Community Role */}
                        <div className="card" style={{ padding: 24 }}>
                          <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Community Role</div>
                          <div style={{ fontSize: 14, color: "#1A1208", marginBottom: 8 }}>
                            {currentUser.role === "mentor" && "You are a Sin Seh (先生) — an experienced mentor. Learners can find you in the Network directory."}
                            {currentUser.role === "mentee" && "You are a learner. Browse Sin Sehs in the Network to find a mentor for your dialect journey."}
                            {currentUser.role === "both" && "You are both a mentor and learner. Help others while continuing your own dialect journey."}
                            {currentUser.role === "none" && "You're exploring the community. You can update your role anytime to connect with mentors or mentees."}
                          </div>
                          <button className="btn-primary" onClick={() => setScreen("network")} style={{ marginTop: 12, width: "100%" }}>
                            Go to Network
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : pendingGoogle ? (
            <div className="card" style={{ padding: 36 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 6 }}>
                Complete Your Heritage Profile
              </div>
              <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 28 }}>
                Signed in as <strong>{pendingGoogle.googleData.email}</strong>. A language lost is a worldview lost. Let's start your dialect journey.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[["First Name", "text", profileForm.firstName, v => setProfileForm(f => ({ ...f, firstName: v }))],
                  ["Last Name", "text", profileForm.lastName, v => setProfileForm(f => ({ ...f, lastName: v }))]].map(([label, type, val, setter]) => (
                  <div key={label}>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                    <input className="input" type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label} />
                  </div>
                ))}
              </div>

              {[["Age", "number", profileForm.age, v => setProfileForm(f => ({ ...f, age: v }))],
                ["Occupation", "text", profileForm.occupation, v => setProfileForm(f => ({ ...f, occupation: v }))]].map(([label, type, val, setter]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                  <input className="input" type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label} />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Dialect Interest (Optional)</label>
                <select value={profileForm.languageInterest} onChange={e => setProfileForm(f => ({ ...f, languageInterest: e.target.value }))} className="input"
                  style={{ height: 44 }}>
                  <option value="">—  Not interested in learning</option>
                  {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Dialects I already know</label>
                <div className="pill-toggle" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(d => {
                    const checked = (profileForm.dialectsKnown || []).includes(d);
                    return (
                      <button key={d} type="button"
                        onClick={() => setProfileForm(f => ({
                          ...f,
                          dialectsKnown: checked
                            ? f.dialectsKnown.filter(x => x !== d)
                            : [...(f.dialectsKnown || []), d],
                        }))}
                        className={checked ? "active" : ""}
                        style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid " + (checked ? "#C0392B" : "#E8DDD0"), background: checked ? "#FDF0EF" : "white", color: checked ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                        {checked ? "✓ " : ""}{d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>My gender</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["male", Mars, "Male"], ["female", Venus, "Female"]].map(([val, icon, label]) => (
                    <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, gender: val }))}
                      style={{ flex: 1, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (profileForm.gender === val ? "#C0392B" : "#E8DDD0"), background: profileForm.gender === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: profileForm.gender === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>I want to join as a</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {[["mentee", "Mentee", "Learn dialects"], ["mentor", "Mentor", "Teach as a Sin Seh"], ["both", "Both", "Learn & teach"], ["none", "Observer", "Just exploring"]].map(([val, label, sub]) => {
                    const emoji = val === "both" || val === "none" ? "👤" : getAvatar(profileForm.gender, val);
                    return (
                      <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, role: val }))}
                        style={{ flex: 1, minWidth: 100, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (profileForm.role === val ? "#C0392B" : "#E8DDD0"), background: profileForm.role === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: profileForm.role === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                        <div style={{ fontSize: 10, color: "#9B8B75", marginTop: 2 }}>{sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="btn-primary" onClick={completeProfile} style={{ width: "100%" }}>
                Complete Profile
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 36, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 12 }}>
                Welcome to tiagong.sg
              </div>
              <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 32 }}>
                A language lost is a worldview lost. Sign in to start your dialect learning journey and connect with native speakers across Singapore.
              </p>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setAuthError("Google sign-in failed")}
                  text="signin_with"
                />
              </div>
            </div>
          )}

          {authError && (
            <div style={{ marginTop: 16, padding: 12, background: "#FDF0EF", border: "1px solid #C0392B", borderRadius: 10, color: "#C0392B", fontSize: 13 }}>
              {authError}
            </div>
          )}
          {successMessage && (
            <div style={{ marginTop: 16, padding: 12, background: "#EAFAF1", border: "1px solid #1A6B3C", borderRadius: 10, color: "#1A6B3C", fontSize: 13 }}>
              {successMessage}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function DialectPlatform() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FEF8F3', fontSize: 14, color: '#8B7355' }}>Loading...</div>}>
      <DialectPlatformContent />
    </Suspense>
  );
}
