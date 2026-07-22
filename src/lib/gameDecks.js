// Pure deck-building helpers for the learning games (src/components/games/*).
// Every function takes apiWords/dialectId/etc as explicit arguments rather than
// closing over React state, so callers always get a deck built from the current
// data — no stale-closure bugs from useCallback/useMemo dependency mistakes.

import { lessons, sentenceCompletion, categories } from "@/data/staticData";
import { hokkienFlashcards } from "@/data/flashcardsHokkien";
import { cantoneseFlashcards } from "@/data/flashcardsCantonese";
import { teochewFlashcards } from "@/data/flashcardsTeochew";
import { hakkaFlashcards } from "@/data/flashcardsHakka";
import { hainaneseFlashcards } from "@/data/flashcardsHainanese";
import { seededRandom, getDailyChallengeSeed } from "@/data/xpSystem";

const EXTRA_CARDS_MAP = {
  hokkien: hokkienFlashcards, cantonese: cantoneseFlashcards, teochew: teochewFlashcards,
  hakka: hakkaFlashcards, hainanese: hainaneseFlashcards,
};

const SPEED_CATS = ["greetings", "numbers", "food", "verbs", "family", "emotions", "hawker", "travel", "body", "time", "daily_life"];

// Flashcard deck: hardcoded lessons + dictionary words with full rich data.
export function buildCardsForCategory(apiWords, dialectId, catId) {
  const dictForCat = dialectId ? apiWords.filter(w => w.dialect === dialectId && (w.tags || []).includes(catId)) : [];
  const staticCards = (dialectId && lessons[dialectId]?.[catId]) || [];
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
        wordId: dictMatch.id,
      };
    }
    return { ...sc, ipa: '', pos: '', examples: [], frequency: 'common', register: 'informal', fromDictionary: false, staticSource: 'lessons' };
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
    wordId: d.id,
  }));
  return [...richStatic, ...dictCards];
}

// Speed Round: generate questions from lessons + expanded data + dictionary.
export function buildSpeedQuestions(apiWords, dialectId) {
  const allCards = [];
  for (const cat of SPEED_CATS) {
    const cards = lessons[dialectId]?.[cat] || [];
    for (const card of cards) allCards.push({ ...card, staticSource: 'lessons' });
  }
  const extraCards = EXTRA_CARDS_MAP[dialectId];
  if (extraCards) {
    for (const cat of SPEED_CATS) {
      const cards = extraCards[cat] || [];
      for (const card of cards) allCards.push({ ...card, staticSource: 'flashcards' });
    }
  }
  if (apiWords.length > 0) {
    const dictWords = apiWords.filter(w => w.dialect === dialectId);
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
          wordId: w.id,
        });
      }
    }
  }
  const shuffled = allCards.sort(() => Math.random() - 0.5).slice(0, 20);
  return shuffled.map(card => {
    const wrongCards = allCards.filter(c => c.phrase !== card.phrase).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [card.phrase, ...wrongCards.map(c => c.phrase)].sort(() => Math.random() - 0.5);
    return {
      english: card.meaning,
      chinese: card.chinese,
      romanisation: card.phrase,
      ipa: card.ipa || '',
      pos: card.pos || '',
      options,
      correctIndex: options.indexOf(card.phrase),
      answerPhrase: card.phrase,
      wordId: card.wordId,
      staticSource: card.staticSource,
    };
  });
}

// Daily Challenge: 10 questions from the learner's current dialect (dictionary
// words as the primary source, static lessons as a fallback if the dictionary
// doesn't have enough entries yet for this dialect).
export function buildDailyQuestions(apiWords, dialectId) {
  const allCards = [];
  const dictWords = apiWords.filter(w => w.dialect === dialectId);
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
        wordId: w.id,
      });
    }
  }
  if (allCards.length < 10) {
    for (const cat of SPEED_CATS) {
      const cards = lessons[dialectId]?.[cat] || [];
      for (const card of cards) {
        if (!allCards.find(c => c.phrase === card.phrase)) {
          allCards.push({ ...card, ipa: '', pos: '', examples: [], staticSource: 'lessons' });
        }
      }
    }
  }
  const seed = getDailyChallengeSeed();
  const rng = seededRandom(seed);
  const shuffled = allCards.sort(() => rng() - 0.5).slice(0, 10);
  return shuffled.map(card => {
    const wrongCards = allCards.filter(c => c.phrase !== card.phrase).sort(() => rng() - 0.5).slice(0, 3);
    const options = [card.phrase, ...wrongCards.map(c => c.phrase)].sort(() => rng() - 0.5);
    return {
      english: card.meaning,
      chinese: card.chinese,
      romanisation: card.phrase,
      ipa: card.ipa || '',
      pos: card.pos || '',
      options,
      correctIndex: options.indexOf(card.phrase),
      wordId: card.wordId,
      staticSource: card.staticSource,
    };
  });
}

// Reverse Flashcards (English → dialect): dictionary + hardcoded cards for the
// given dialect + category. catId is an explicit argument so callers can pass
// the category being switched TO, avoiding stale-closure deck rebuilds.
export function buildReverseCards(apiWords, dialectId, catId) {
  const cards = [];
  const dictMatches = apiWords.filter(w => w.dialect === dialectId && (w.tags || []).includes(catId));
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
      wordId: w.id,
    });
  }
  const staticCards = lessons[dialectId]?.[catId] || [];
  for (const sc of staticCards) {
    if (!cards.find(c => c.phrase === sc.phrase)) {
      cards.push({ ...sc, ipa: '', pos: '', examples: [], cardIndex: cards.length, staticSource: 'lessons' });
    }
  }
  return cards.sort(() => Math.random() - 0.5);
}

// Fill-in-the-blank exercises: static seed set + exercises generated live from
// dictionary DB words that have example sentences, so the game grows as
// contributors add words and usage examples.
export function buildSentenceExercises(apiWords, dialectId) {
  const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dictWords = apiWords.filter(w => w.dialect === dialectId);
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
      wordId: w.id,
    });
  }
  const seed = (sentenceCompletion[dialectId] || []).map(s => ({ ...s, staticSource: 'sentenceCompletion' }));
  return [...seed, ...dynamic.sort(() => Math.random() - 0.5)].slice(0, 15);
}

// Review queue: cards across every category not yet marked "known". Keyed by
// phrase (not array index) so a deck that shifts size/order after dictionary
// words load in can't cause "Know it" to mark the wrong card.
export function buildReviewQueue(apiWords, dialectId, knownCards) {
  const queue = [];
  for (const cat of categories) {
    const catCards = buildCardsForCategory(apiWords, dialectId, cat.id);
    for (const card of catCards) {
      const key = `${dialectId}-${cat.id}-${card.phrase}`;
      if (!knownCards[key]) queue.push({ category: cat.id, key, card });
    }
  }
  return queue.sort(() => Math.random() - 0.5);
}
