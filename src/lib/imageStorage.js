import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

export { isBlobConfigured } from '@/lib/audioStorage';

export async function uploadImage(base64, mimeType) {
  const buffer = Buffer.from(base64, 'base64');
  const ext = mimeType.split('/')[1]?.split(';')[0] || 'jpg';
  const blob = await put(`avatars/${randomUUID()}.${ext}`, buffer, {
    access: 'public',
    contentType: mimeType,
    addRandomSuffix: false,
  });
  return blob.url;
}

// Best-effort cleanup — never throws, mirrors deleteAudio in audioStorage.js.
export async function deleteImage(url) {
  try {
    await del(url);
  } catch (err) {
    console.error('Failed to delete orphaned avatar blob:', err);
  }
}
