import { query } from '@/lib/db';
import { getAvatar } from '@/lib/avatar';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const dialectGroup = searchParams.get('dialect');

    let sql = `SELECT id, first_name, last_name, age, occupation, dialect_group, dialects_known,
      role, gender, intent, offerings, availability, formats, region, interests, proficiency,
      bio, huay_kuan, verified, created_at,
      (SELECT COUNT(*) FROM connections c WHERE (c.requester_id = users.id OR c.receiver_id = users.id) AND c.status = 'accepted') AS mentee_count
      FROM users WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (role && role !== 'All') {
      sql += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (dialectGroup && dialectGroup !== 'All') {
      sql += ` AND dialect_group = $${paramCount}`;
      params.push(dialectGroup);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const result = await query(sql, params);

    // Note: email is intentionally NOT returned here — this endpoint is
    // unauthenticated. Contact happens via in-app chat (see /api/messages),
    // not by exposing addresses to anyone who loads the network directory.
    const users = result.rows.map(u => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      age: u.age,
      occupation: u.occupation,
      languageInterest: u.dialect_group,
      dialectsKnown: u.dialects_known || [],
      role: u.role,
      gender: u.gender,
      intent: u.intent,
      offerings: u.offerings || [],
      availability: u.availability || [],
      formats: u.formats || [],
      region: u.region,
      interests: u.interests || [],
      proficiency: u.proficiency,
      bio: u.bio,
      huayKuan: u.huay_kuan,
      verified: !!u.verified,
      menteeCount: Number(u.mentee_count) || 0,
      avatar: getAvatar(u.gender, u.role)
    }));

    return Response.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return Response.json({ error: 'Failed to fetch profiles', detail: error.message }, { status: 500 });
  }
}
