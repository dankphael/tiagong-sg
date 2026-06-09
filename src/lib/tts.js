// TTS (Text-to-Speech) utility for tiagong-sg
// Uses the free Web Speech API — no API key needed

// Map dialects to BCP-47 language codes for the best available TTS voice
const DIALECT_LANG_CODES = {
  hokkien: "zh-TW",    // Taiwanese (closest to Hokkien)
  cantonese: "zh-HK",  // Hong Kong Cantonese
  teochew: "zh-CN",    // Mandarin (closest available for Teochew)
  hakka: "zh-TW",      // Taiwanese (closest to Hakka)
  hainanese: "zh-CN",  // Mandarin (closest available for Hainanese)
};

// Cache for available voices
let cachedVoices = null;

function getVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  if (cachedVoices) return cachedVoices;
  cachedVoices = window.speechSynthesis.getVoices();
  // Voices may load asynchronously
  if (cachedVoices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
  return cachedVoices;
}

// Pick the best voice for a given language code
function pickVoice(langCode) {
  const voices = getVoices();
  if (!voices.length) return null;

  // Exact match
  let voice = voices.find(v => v.lang === langCode);
  if (voice) return voice;

  // Prefix match (e.g., "zh-TW" matches "zh-TW-xxx")
  voice = voices.find(v => v.lang.startsWith(langCode));
  if (voice) return voice;

  // Broader match (e.g., "zh" for any Chinese)
  const prefix = langCode.split("-")[0];
  voice = voices.find(v => v.lang.startsWith(prefix));
  if (voice) return voice;

  // Fallback to default
  return voices[0] || null;
}

/**
 * Speak a phrase in the given dialect
 * @param {string} text - The text to speak (romanized or Chinese)
 * @param {string} dialect - One of: hokkien, cantonese, teochew, hakka, hainanese
 * @param {object} options - Optional settings
 * @param {number} options.rate - Speech rate (0.1 to 10, default 0.8 for dialects)
 * @param {number} options.pitch - Pitch (0 to 2, default 1)
 */
export function speak(text, dialect = "hokkien", options = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("TTS not supported in this browser");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langCode = DIALECT_LANG_CODES[dialect] || "zh-CN";
  utterance.lang = langCode;
  utterance.rate = options.rate ?? 0.8; // Slower for dialect learners
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  const voice = pickVoice(langCode);
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/**
 * Check if TTS is available
 */
export function isTTSAvailable() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

/**
 * Get the language code for a dialect
 */
export function getDialectLangCode(dialect) {
  return DIALECT_LANG_CODES[dialect] || "zh-CN";
}
