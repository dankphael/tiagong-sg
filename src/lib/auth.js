import jwt from 'jsonwebtoken';

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
