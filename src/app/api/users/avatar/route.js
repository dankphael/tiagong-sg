import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { isBlobConfigured, uploadImage, deleteImage } from '@/lib/imageStorage';

const VALID_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BASE64_CHARS = 700_000; // ~500KB decoded — client pre-crops/resizes to 256x256
const MAX_BODY_BYTES = 900_000;

// POST {imageData: base64, mimeType} — upload/replace the caller's profile
// photo. Photos are always public (visible in the network directory), so
// unlike audio_clips there's no access-gated serve path — we just store the
// Blob's public URL and let <img> hit the CDN directly.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  if (!isBlobConfigured()) {
    return Response.json({ error: "Photo uploads aren't available right now" }, { status: 503 });
  }

  const contentLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Image is too large' }, { status: 413 });
  }

  try {
    const { imageData, mimeType } = await req.json();

    if (typeof imageData !== 'string' || imageData.length === 0) {
      return Response.json({ error: 'imageData is required' }, { status: 400 });
    }
    if (imageData.length > MAX_IMAGE_BASE64_CHARS) {
      return Response.json({ error: 'Image is too large' }, { status: 400 });
    }
    if (!VALID_IMAGE_MIME_TYPES.includes(mimeType)) {
      return Response.json({ error: 'Invalid image format — use JPEG, PNG, or WebP' }, { status: 400 });
    }

    const prevResult = await query(`SELECT avatar_url FROM users WHERE id = $1`, [decoded.userId]);
    const previousUrl = prevResult.rows[0]?.avatar_url || null;

    const avatarUrl = await uploadImage(imageData, mimeType);
    await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, decoded.userId]);

    if (previousUrl) await deleteImage(previousUrl);

    return Response.json({ avatarUrl }, { status: 200 });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    return Response.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

// DELETE — revert to the emoji avatar.
export async function DELETE(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const prevResult = await query(`SELECT avatar_url FROM users WHERE id = $1`, [decoded.userId]);
    const previousUrl = prevResult.rows[0]?.avatar_url || null;

    await query(`UPDATE users SET avatar_url = NULL WHERE id = $1`, [decoded.userId]);
    if (previousUrl) await deleteImage(previousUrl);

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error removing avatar:', err);
    return Response.json({ error: 'Failed to remove photo' }, { status: 500 });
  }
}
