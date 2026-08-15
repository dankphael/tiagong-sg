// Single "now playing" slot shared by every audio source on the page —
// community recordings (HTMLAudioElement) and the synthetic TTS fallback
// (window.speechSynthesis) — so starting one always stops whatever the
// other was doing. Without this, a clip and the synthesiser could talk
// over each other since they're two unrelated browser APIs.
import { speak, stopSpeaking } from "@/lib/tts";

let currentClip = null;

function stopCurrentClip() {
  if (currentClip) {
    currentClip.pause();
    currentClip = null;
  }
}

// Play a community-recorded clip by URL (e.g. `/api/audio/{id}`). Returns
// the play() promise so callers can .catch it to surface a toast on failure.
export function playClip(url) {
  stopCurrentClip();
  stopSpeaking();
  const audio = new Audio(url);
  currentClip = audio;
  return audio.play();
}

// Play synthesised speech via the shared TTS utility, stopping any clip first.
export function playSynthetic(text, dialect, options) {
  stopCurrentClip();
  speak(text, dialect, options);
}
