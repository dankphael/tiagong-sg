import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// requireAdmin(req) → { error, status, decoded } — same shape as requireAuth.
// Kept separate from auth.js (sync/JWT-only, imported everywhere) since this
// needs a DB read: account_type is DB-authoritative so admin revocation is
// immediate, unlike the JWT itself which is valid for 30 days regardless.
export async function requireAdmin(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return { error, status, decoded };

  try {
    const result = await query(`SELECT account_type, deactivated FROM users WHERE id = $1`, [decoded.userId]);
    const user = result.rows[0];
    if (!user || user.account_type !== 'admin' || user.deactivated) {
      return { error: 'Admin access required', status: 403, decoded: null };
    }
    return { error: null, status: 200, decoded };
  } catch (err) {
    console.error('Error checking admin access:', err);
    return { error: 'Failed to verify admin access', status: 500, decoded: null };
  }
}
