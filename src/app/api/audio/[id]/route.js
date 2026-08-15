import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET — serve an audio clip. Published clips are public — either a
// custodian approved the contribution ('accepted') or it went live
// instantly and the community is voting on it ('published'), see
// api/contributions/route.js. Pending/rejected/removed clips are only
// visible to the submitter, a custodian of that dialect, or an admin.
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const result = await query(
      `SELECT ac.mime_type, ac.data, c.status, c.dialect, c.user_id
       FROM audio_clips ac
       JOIN contributions c ON ac.contribution_id = c.id
       WHERE ac.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Audio clip not found' }, { status: 404 });
    }
    const clip = result.rows[0];

    if (clip.status === 'accepted' || clip.status === 'published') {
      return new Response(Buffer.from(clip.data, 'base64'), {
        status: 200,
        headers: {
          'Content-Type': clip.mime_type,
          // Not immutable/year-long: instant-publish clips can be taken
          // down by a custodian (DELETE /api/variants/[id]) with no review
          // step beforehand, so a takedown needs to actually take effect
          // within the hour rather than surviving in caches for a year.
          'Cache-Control': 'public, max-age=3600',
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
