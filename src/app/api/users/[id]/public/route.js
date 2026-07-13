import { query } from '@/lib/db';

// GET — public member profile. Deliberately excludes contact/private fields
// (email, age, occupation) that the network directory cards already keep
// private-ish but a dedicated public URL shouldn't leak at all.
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId)) {
      return Response.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const result = await query(
      `SELECT id, first_name, last_name, gender, role, dialect_group, verified,
              custodian_dialects, heritage_story, bio, xp, streak, created_at, deactivated
       FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0 || result.rows[0].deactivated) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }
    const u = result.rows[0];

    const contribResult = await query(
      `SELECT type, COUNT(*) AS n FROM contributions WHERE user_id = $1 AND status = 'accepted' GROUP BY type`,
      [userId]
    );
    const contributions = {};
    for (const row of contribResult.rows) contributions[row.type] = Number(row.n);

    return Response.json({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      gender: u.gender,
      role: u.role || 'mentee',
      languageInterest: u.dialect_group,
      verified: !!u.verified,
      custodianDialects: u.custodian_dialects || [],
      heritageStory: u.heritage_story || '',
      bio: u.bio || '',
      xp: u.xp || 0,
      streak: u.streak || 0,
      memberSince: u.created_at,
      contributions,
    }, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
