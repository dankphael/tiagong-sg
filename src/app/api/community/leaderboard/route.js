import { query } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';

const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

// Monday 00:00 Singapore time, expressed as a true UTC instant. Assumes
// created_at/reviewed_at are stored as UTC timestamps (Postgres default
// CURRENT_TIMESTAMP behavior) — good enough for a weekly leaderboard, not
// meant to be to-the-second precise.
function weekStartUtc(offsetWeeks = 0) {
  const nowSgt = new Date(Date.now() + SGT_OFFSET_MS);
  const day = nowSgt.getUTCDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const mondaySgt = Date.UTC(nowSgt.getUTCFullYear(), nowSgt.getUTCMonth(), nowSgt.getUTCDate() - diffToMonday - offsetWeeks * 7, 0, 0, 0);
  return new Date(mondaySgt - SGT_OFFSET_MS);
}

function displayName(row) {
  return `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'A community member';
}

function rowToEntry(row) {
  return {
    userId: row.id,
    name: displayName(row),
    gender: row.gender,
    role: row.role,
    verified: !!row.verified,
    score: Number(row.score),
    rank: Number(row.rank),
  };
}

async function fetchBoard(board, dialect, weekStart) {
  if (board === 'builders') {
    const params = [weekStart];
    let dialectClause = '';
    if (dialect) { params.push(dialect); dialectClause = `AND c.dialect = $${params.length}`; }
    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.gender, u.role, u.verified,
              COUNT(c.id) AS score,
              RANK() OVER (ORDER BY COUNT(c.id) DESC) AS rank
       FROM users u
       JOIN contributions c ON c.user_id = u.id AND c.status = 'accepted' AND c.reviewed_at >= $1 ${dialectClause}
       WHERE NOT COALESCE(u.leaderboard_opt_out, false) AND NOT COALESCE(u.deactivated, false)
       GROUP BY u.id
       ORDER BY score DESC`,
      params
    );
    return result.rows;
  }

  const params = [weekStart];
  let dialectClause = '';
  if (dialect) { params.push(dialect); dialectClause = `AND u.dialect_group = $${params.length}`; }
  const result = await query(
    `SELECT u.id, u.first_name, u.last_name, u.gender, u.role, u.verified,
            COALESCE(SUM(xe.amount), 0) AS score,
            RANK() OVER (ORDER BY COALESCE(SUM(xe.amount), 0) DESC) AS rank
     FROM users u
     LEFT JOIN xp_events xe ON xe.user_id = u.id AND xe.created_at >= $1
     WHERE NOT COALESCE(u.leaderboard_opt_out, false) AND NOT COALESCE(u.deactivated, false) ${dialectClause}
     GROUP BY u.id
     HAVING COALESCE(SUM(xe.amount), 0) > 0
     ORDER BY score DESC`,
    params
  );
  return result.rows;
}

// GET ?board=learners|builders&dialect=<display name, optional> — public
// weekly leaderboard. If an auth token is present, includes the caller's
// own rank even when outside the top 10.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get('board') === 'builders' ? 'builders' : 'learners';
    const dialect = searchParams.get('dialect') || null;

    const currentWeekStart = weekStartUtc(0).toISOString();
    const prevWeekStart = weekStartUtc(1).toISOString();

    const currentRows = await fetchBoard(board, dialect, currentWeekStart);

    // Previous week's champions need a closed [prevWeekStart, currentWeekStart)
    // window, not the >= used by fetchBoard, so this is a separate query.
    const champParams = dialect ? [prevWeekStart, currentWeekStart, dialect] : [prevWeekStart, currentWeekStart];
    const champDialectClause = board === 'builders'
      ? (dialect ? 'AND c.dialect = $3' : '')
      : (dialect ? 'AND u.dialect_group = $3' : '');
    const champRows = board === 'builders'
      ? (await query(
          `SELECT u.id, u.first_name, u.last_name, u.gender, u.role, u.verified,
                  COUNT(c.id) AS score, RANK() OVER (ORDER BY COUNT(c.id) DESC) AS rank
           FROM users u
           JOIN contributions c ON c.user_id = u.id AND c.status = 'accepted' AND c.reviewed_at >= $1 AND c.reviewed_at < $2 ${champDialectClause}
           WHERE NOT COALESCE(u.leaderboard_opt_out, false) AND NOT COALESCE(u.deactivated, false)
           GROUP BY u.id ORDER BY score DESC LIMIT 3`,
          champParams
        )).rows
      : (await query(
          `SELECT u.id, u.first_name, u.last_name, u.gender, u.role, u.verified,
                  COALESCE(SUM(xe.amount), 0) AS score, RANK() OVER (ORDER BY COALESCE(SUM(xe.amount), 0) DESC) AS rank
           FROM users u
           LEFT JOIN xp_events xe ON xe.user_id = u.id AND xe.created_at >= $1 AND xe.created_at < $2
           WHERE NOT COALESCE(u.leaderboard_opt_out, false) AND NOT COALESCE(u.deactivated, false) ${champDialectClause}
           GROUP BY u.id HAVING COALESCE(SUM(xe.amount), 0) > 0 ORDER BY score DESC LIMIT 3`,
          champParams
        )).rows;

    const token = extractToken(req);
    const decoded = token ? verifyToken(token) : null;
    const meRow = decoded ? currentRows.find(r => r.id === decoded.userId) : null;

    return Response.json({
      top: currentRows.slice(0, 10).map(rowToEntry),
      me: meRow ? rowToEntry(meRow) : null,
      champions: champRows.map(rowToEntry),
    }, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
