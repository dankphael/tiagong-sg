import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET — serve an audio clip. Accepted (i.e. its contribution has been
// approved by a custodian) clips are public with long-lived caching, since
// they're already visible to everyone on the dictionary page. Pending/
// rejected clips are only visible to the submitter, a custodian of that
// dialect, or an admin — reviewers need to hear a clip before approving it.
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const result = await query(
      `SELECT ac.mime_type, ac.data, ac.blob_url, c.status, c.dialect, c.user_id
       FROM audio_clips ac
       JOIN contributions c ON ac.contribution_id = c.id
       WHERE ac.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Audio clip not found' }, { status: 404 });
    }
    const clip = result.rows[0];

    if (clip.status === 'accepted') {
      // Blob-stored clips redirect straight to the CDN — no DB payload, no
      // Node decode. Legacy base64 rows keep the old inline-serve path.
      if (clip.blob_url) {
        return Response.redirect(clip.blob_url, 302);
      }
      return new Response(Buffer.from(clip.data, 'base64'), {
        status: 200,
        headers: {
          'Content-Type': clip.mime_type,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const { error, status, decoded } = requireAuth(req);
    if (error) return Response.json({ error }, { status });

    if (decoded.userId === clip.user_id) {
      // submitter may always hear their own pending/rejected recording
    } else {
      const userResult = await query(`SELECT custodian_dialects, account_type FROM users WHERE id = $1`, [decoded.userId]);
      const custodianDialects = userResult.rows[0]?.custodian_dialects || [];
      const isAdmin = userResult.rows[0]?.account_type === 'admin';
      const isCustodianForDialect = Array.isArray(custodianDialects) && custodianDialects.includes(clip.dialect);
      if (!isAdmin && !isCustodianForDialect) {
        return Response.json({ error: 'Not authorized to access this recording' }, { status: 403 });
      }
    }

    // Pending/rejected clips stay access-gated even when stored in Blob
    // (its URL is otherwise unguessable but not access-controlled), so we
    // fetch and re-stream it ourselves instead of redirecting.
    if (clip.blob_url) {
      const blobRes = await fetch(clip.blob_url);
      if (!blobRes.ok) {
        return Response.json({ error: 'Failed to load audio' }, { status: 502 });
      }
      return new Response(blobRes.body, {
        status: 200,
        headers: {
          'Content-Type': clip.mime_type,
          'Cache-Control': 'no-store',
        },
      });
    }

    return new Response(Buffer.from(clip.data, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': clip.mime_type,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Error serving audio clip:', err);
    return Response.json({ error: 'Failed to load audio' }, { status: 500 });
  }
}
