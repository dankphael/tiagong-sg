import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { INTENTS, AVAILABILITY_SLOTS, FORMATS, REGIONS, PROFICIENCY_LEVELS } from '@/lib/matching';

const VALID_INTENTS = INTENTS.map(i => i.id);
const VALID_AVAILABILITY = AVAILABILITY_SLOTS.map(s => s.id);
const VALID_FORMATS = FORMATS.map(f => f.id);
const VALID_REGIONS = REGIONS.map(r => r.id);
const VALID_PROFICIENCY = PROFICIENCY_LEVELS.map(p => p.id);

export async function PATCH(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const {
      username, firstName, lastName, age, occupation, languageInterest, role, gender, dialectsKnown,
      intent, offerings, availability, formats, region, interests, proficiency, bio, huayKuan,
      heritageStory, leaderboardOptOut,
    } = await req.json();

    if (!gender || !['male', 'female'].includes(gender)) {
      return Response.json({ error: 'Gender is required and must be male or female' }, { status: 400 });
    }

    if (username) {
      const existingUsername = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, decoded.userId]
      );
      if (existingUsername.rows.length > 0) {
        return Response.json({ error: 'Username already taken' }, { status: 409 });
      }
    }

    if (intent != null && !VALID_INTENTS.includes(intent)) {
      return Response.json({ error: 'Invalid intent' }, { status: 400 });
    }
    if (region != null && !VALID_REGIONS.includes(region)) {
      return Response.json({ error: 'Invalid region' }, { status: 400 });
    }
    if (proficiency != null && !VALID_PROFICIENCY.includes(proficiency)) {
      return Response.json({ error: 'Invalid proficiency' }, { status: 400 });
    }
    for (const o of offerings || []) {
      if (!VALID_INTENTS.includes(o)) return Response.json({ error: 'Invalid offering' }, { status: 400 });
    }
    for (const a of availability || []) {
      if (!VALID_AVAILABILITY.includes(a)) return Response.json({ error: 'Invalid availability slot' }, { status: 400 });
    }
    for (const f of formats || []) {
      if (!VALID_FORMATS.includes(f)) return Response.json({ error: 'Invalid format' }, { status: 400 });
    }

    await query(
      `UPDATE users SET username=$1, first_name=$2, last_name=$3, age=$4, occupation=$5,
       dialect_group=$6, role=$7, gender=$8, dialects_known=$9,
       intent=$10, offerings=$11, availability=$12, formats=$13, region=$14,
       interests=$15, proficiency=$16, bio=$17, huay_kuan=$18,
       heritage_story=$19, leaderboard_opt_out=$20,
       updated_at=CURRENT_TIMESTAMP WHERE id=$21`,
      [
        username || null,
        firstName || null,
        lastName || null,
        age || null,
        occupation || null,
        languageInterest || null,
        role || 'mentee',
        gender,
        JSON.stringify(dialectsKnown || []),
        intent || null,
        JSON.stringify(offerings || []),
        JSON.stringify(availability || []),
        JSON.stringify(formats || []),
        region || null,
        JSON.stringify(interests || []),
        proficiency || null,
        bio || null,
        huayKuan || null,
        heritageStory || null,
        !!leaderboardOptOut,
        decoded.userId,
      ]
    );

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error updating profile:', err);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
