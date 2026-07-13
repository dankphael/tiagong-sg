import { query } from '@/lib/db';
import { getAvatar } from '@/lib/avatar';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const dialectGroup = searchParams.get('dialect');

    // mentee_count is precomputed once as a join instead of a correlated
    // subquery per row, so the cost doesn't scale with the number of users
    // returned.
    let sql = `WITH mentee_counts AS (
        SELECT user_id, COUNT(*) AS cnt FROM (
          SELECT requester_id AS user_id FROM connections WHERE status = 'accepted'
          UNION ALL
          SELECT receiver_id AS user_id FROM connections WHERE status = 'accepted'
        ) c GROUP BY user_id
      )
      SELECT u.id, u.first_name, u.last_name, u.age, u.occupation, u.dialect_group, u.dialects_known,
      u.role, u.gender, u.intent, u.offerings, u.availability, u.formats, u.region, u.interests, u.proficiency,
      u.bio, u.huay_kuan, u.verified, u.created_at, u.avatar_url,
      COALESCE(mc.cnt, 0) AS mentee_count
      FROM users u
      LEFT JOIN mentee_counts mc ON mc.user_id = u.id
      WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (role && role !== 'All') {
      sql += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (dialectGroup && dialectGroup !== 'All') {
      sql += ` AND u.dialect_group = $${paramCount}`;
      params.push(dialectGroup);
      paramCount++;
    }

    sql += ' ORDER BY u.created_at DESC LIMIT 100';

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
      avatar: getAvatar(u.gender, u.role),
      avatarUrl: u.avatar_url || null
    }));

    return Response.json(users, { status: 200, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return Response.json({ error: 'Failed to fetch profiles', detail: error.message }, { status: 500 });
  }
}
