// Shared validation for client-recorded audio clips (AudioRecorder output),
// used by both contribution submissions and Ask a Senior answers.
export const VALID_AUDIO_MIME_TYPES = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];
export const MAX_AUDIO_BASE64_CHARS = 400_000; // ~300KB decoded, generous for a ~10s clip
export const MAX_AUDIO_DURATION_MS = 11_000;

export function validateAudioFields(audioData, audioMimeType, durationMs) {
  if (typeof audioData !== 'string' || audioData.length === 0) return 'audioData is required';
  if (audioData.length > MAX_AUDIO_BASE64_CHARS) return 'Recording is too large (max ~10 seconds)';
  if (!VALID_AUDIO_MIME_TYPES.includes(audioMimeType)) return 'Invalid audio format';
  if (typeof durationMs !== 'number' || durationMs <= 0 || durationMs > MAX_AUDIO_DURATION_MS) return 'Invalid recording duration';
  return null;
}
