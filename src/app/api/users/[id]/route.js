import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET: Fetch current user's profile
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;

    // Fetch user profile
    const result = await query(
      'SELECT id, email, first_name, last_name, age, occupation, role, dialect_group, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return Response.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

// PUT: Update user profile
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    
    // Verify user can only update their own profile
    if (auth.decoded.userId !== parseInt(id)) {
      return Response.json({ error: 'Not authorized to update this profile' }, { status: 403 });
    }

    const { first_name, last_name, age, occupation, dialect_group, role } = await req.json();

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }
    if (age !== undefined) {
      updates.push(`age = $${paramCount}`);
      values.push(age);
      paramCount++;
    }
    if (occupation !== undefined) {
      updates.push(`occupation = $${paramCount}`);
      values.push(occupation);
      paramCount++;
    }
    if (dialect_group !== undefined) {
      updates.push(`dialect_group = $${paramCount}`);
      values.push(dialect_group);
      paramCount++;
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, age, occupation, role, dialect_group, updated_at`,
      values
    );

    return Response.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return Response.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
