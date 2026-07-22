import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { dialects } from '@/data/staticData';

const VALID_DIALECTS = dialects.map(d => d.id);

// POST — apply (or re-apply) to become a Language Custodian. The owner
// approves by setting users.custodian_dialects directly in the DB — no
// admin UI in v1.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { dialects: appliedDialects, background, credentials, huayKuan } = await req.json();

    const cleanDialects = (Array.isArray(appliedDialects) ? appliedDialects : []).filter(d => VALID_DIALECTS.includes(d));
    if (cleanDialects.length === 0) {
      return Response.json({ error: 'Select at least one dialect' }, { status: 400 });
    }
    if (!background) {
      return Response.json({ error: 'Please share your dialect background' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO custodian_applications (user_id, dialects, background, credentials, huay_kuan)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         dialects = $2, background = $3, credentials = $4, huay_kuan = $5,
         status = 'pending', created_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, dialects, background, credentials, huay_kuan, status, created_at`,
      [decoded.userId, JSON.stringify(cleanDialects), background, credentials || null, huayKuan || null]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Error submitting custodian application:', err);
    return Response.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

// GET — the caller's own application status
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT id, dialects, background, credentials, huay_kuan, status, created_at
       FROM custodian_applications WHERE user_id = $1`,
      [decoded.userId]
    );

    return Response.json(result.rows[0] || null, { status: 200 });
  } catch (err) {
    console.error('Error fetching custodian application:', err);
    return Response.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}
