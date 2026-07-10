import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// PATCH {action: 'approve'|'reject'} — approve sets the applicant's
// custodian_dialects to the applied dialects (the actual grant of
// custodian status); reject just flips the application status.
export async function PATCH(req, { params }) {
  const { error, status } = await requireAdmin(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const appResult = await query(`SELECT * FROM custodian_applications WHERE id = $1`, [id]);
    if (appResult.rows.length === 0) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }
    const application = appResult.rows[0];

    if (application.status !== 'pending') {
      return Response.json({ error: 'This application has already been reviewed' }, { status: 409 });
    }

    if (action === 'approve') {
      await query(`UPDATE users SET custodian_dialects = $1 WHERE id = $2`, [
        JSON.stringify(application.dialects || []),
        application.user_id,
      ]);
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updated = await query(
      `UPDATE custodian_applications SET status = $1 WHERE id = $2
       RETURNING id, user_id, dialects, background, credentials, huay_kuan, status, created_at`,
      [newStatus, id]
    );

    return Response.json(updated.rows[0], { status: 200 });
  } catch (err) {
    console.error('Error reviewing custodian application:', err);
    return Response.json({ error: 'Failed to review application' }, { status: 500 });
  }
}
