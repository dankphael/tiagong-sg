import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

// Voice recordings go to Vercel Blob when a store is attached to the
// project (BLOB_READ_WRITE_TOKEN set); otherwise contributions/route.js
// falls back to storing base64 directly in audio_clips.data, so every
// environment (including this dead-DB sandbox) keeps working.
export function isBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function uploadAudio(base64, mimeType) {
  const buffer = Buffer.from(base64, 'base64');
  const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm';
  const blob = await put(`audio/${randomUUID()}.${ext}`, buffer, {
    access: 'public',
    contentType: mimeType,
    addRandomSuffix: false,
  });
  return blob.url;
}

// Best-effort cleanup — called when a DB transaction fails after upload.
// Never throws: an orphaned blob is a minor cost, not worth masking the
// original error over.
export async function deleteAudio(url) {
  try {
    await del(url);
  } catch (err) {
    console.error('Failed to delete orphaned audio blob:', err);
  }
}
