import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { getAvatar } from '@/lib/avatar';

// Verify the Google ID token against Google's tokeninfo endpoint rather than
// trusting a local base64 decode — an unverified credential is forgeable by
// anyone, which would allow signing in as an arbitrary email. tokeninfo
// checks the signature, expiry, and issuer for us; we additionally pin the
// audience to OUR client id so tokens minted for other apps are rejected.
async function verifyGoogleCredential(credential) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const payload = await res.json();
  const expectedAud = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!expectedAud || payload.aud !== expectedAud) return null;
  if (!payload.email || payload.email_verified !== 'true') return null;
  const [firstName, ...rest] = (payload.name || '').split(' ');
  return {
    email: payload.email,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    picture: payload.picture || null,
  };
}

function signToken(userId, email) {
  if (!process.env.JWT_SECRET) {
    // Refuse to mint tokens with a guessable secret — a hardcoded fallback
    // here would make every session forgeable.
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function userResponse(row, picture) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    occupation: row.occupation,
    role: row.role || 'mentee',
    gender: row.gender,
    languageInterest: row.dialect_group || 'Hokkien',
    avatar: getAvatar(row.gender, row.role || 'mentee'),
    avatarUrl: row.avatar_url || picture || null,
    dialectsKnown: row.dialects_known || [],
    intent: row.intent,
    offerings: row.offerings || [],
    availability: row.availability || [],
    formats: row.formats || [],
    region: row.region,
    interests: row.interests || [],
    proficiency: row.proficiency,
    bio: row.bio,
    huayKuan: row.huay_kuan,
    verified: !!row.verified,
    custodianDialects: row.custodian_dialects || [],
    accountType: row.account_type || 'user',
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { credential, profileData } = body;

    if (!credential) {
      return Response.json({ error: 'Missing Google credential' }, { status: 400 });
    }

    let googleData = null;
    try {
      googleData = await verifyGoogleCredential(credential);
    } catch (e) {
      console.error('Google tokeninfo verification failed:', e);
    }
    if (!googleData) {
      return Response.json({ error: 'Invalid Google credential' }, { status: 401 });
    }

    const existing = await query(
      `SELECT id, email, first_name, last_name, age, occupation, dialect_group, role, gender, dialects_known,
       intent, offerings, availability, formats, region, interests, proficiency, bio, huay_kuan, verified,
       custodian_dialects, account_type, deactivated, avatar_url
       FROM users WHERE email = $1`,
      [googleData.email]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.deactivated) {
        return Response.json({ error: 'This account has been deactivated' }, { status: 403 });
      }
      // Seed the avatar from the Google account photo once, the first time
      // we see this user has none — never overwrites a photo they uploaded.
      if (!row.avatar_url && googleData.picture) {
        await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [googleData.picture, row.id]);
        row.avatar_url = googleData.picture;
      }
      const token = signToken(row.id, row.email);
      return Response.json({ token, user: userResponse(row, googleData.picture) }, { status: 200 });
    }

    if (!profileData) {
      return Response.json({ needsProfile: true, googleData }, { status: 200 });
    }

    const {
      age, occupation, languageInterest, role, gender, firstName, lastName, dialectsKnown,
      intent, offerings, availability, formats, region, interests, proficiency, bio, huayKuan,
    } = profileData;
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, age, occupation, dialect_group, role, gender, dialects_known, password_hash,
       intent, offerings, availability, formats, region, interests, proficiency, bio, huay_kuan, verified, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING id, email, first_name, last_name, age, occupation, dialect_group, role, gender, dialects_known,
       intent, offerings, availability, formats, region, interests, proficiency, bio, huay_kuan, verified,
       custodian_dialects, account_type, avatar_url`,
      [
        googleData.email,
        firstName || googleData.firstName,
        lastName || googleData.lastName,
        age || null,
        occupation || null,
        languageInterest || 'Hokkien',
        role || 'mentee',
        gender || null,
        JSON.stringify(dialectsKnown || []),
        'google-oauth',
        intent || null,
        JSON.stringify(offerings || []),
        JSON.stringify(availability || []),
        JSON.stringify(formats || []),
        region || null,
        JSON.stringify(interests || []),
        proficiency || null,
        bio || null,
        huayKuan || null,
        false,
        googleData.picture || null,
      ]
    );

    const row = result.rows[0];
    const token = signToken(row.id, row.email);
    return Response.json({ token, user: userResponse(row, googleData.picture) }, { status: 201 });
  } catch (error) {
    console.error('Google OAuth error:', error);
    if (error.message === 'JWT_SECRET is not configured') {
      return Response.json({ error: 'Sign-in is not configured on the server' }, { status: 500 });
    }
    return Response.json({ error: 'Authentication failed', detail: error.message }, { status: 500 });
  }
}
