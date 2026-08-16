import { query } from '@/lib/db';

// GET — total active member count only. Public and PII-free by design: the
// about page's impact stats need a headline number for guests, who can't
// call the now-auth-gated /api/users/profiles directory.
export async function GET() {
  try {
    const result = await query(`SELECT COUNT(*) AS n FROM users WHERE NOT COALESCE(deactivated, false)`);
    return Response.json({ count: Number(result.rows[0].n) }, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return Response.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
