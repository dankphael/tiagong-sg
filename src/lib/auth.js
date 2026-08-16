import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

let warnedMissingSecret = false;

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    // Never verify against a guessable fallback secret — that would make
    // every session token forgeable. Treat all tokens as invalid (401)
    // until the server is configured.
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.error('JWT_SECRET is not set — refusing to verify session tokens until it is configured.');
    }
    return null;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function extractToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function requireAuth(req) {
  const token = extractToken(req);
  if (!token) {
    return { error: 'Unauthorized', status: 401, decoded: null };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401, decoded: null };
  }

  return { error: null, status: 200, decoded };
}

// Same as requireAuth, plus a DB check that the account hasn't been
// deactivated since the token was issued. Tokens are valid for 30 days with
// no refresh, so requireAuth alone lets a banned user keep writing (voting,
// contributing, messaging) for the rest of that window — the moderation tool
// doesn't actually moderate. Use this on every mutating route.
export async function requireActiveAuth(req) {
  const auth = requireAuth(req);
  if (auth.error) return auth;

  const result = await query('SELECT deactivated FROM users WHERE id = $1', [auth.decoded.userId]);
  if (result.rows.length === 0 || result.rows[0].deactivated) {
    return { error: 'Account deactivated', status: 403, decoded: null };
  }

  return auth;
}
