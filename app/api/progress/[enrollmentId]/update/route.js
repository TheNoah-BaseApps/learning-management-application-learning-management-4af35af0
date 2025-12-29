/**
 * @swagger
 * /api/progress/{enrollmentId}/update:
 *   put:
 *     summary: Update progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';

export async function PUT(request, { params }) {
  const client = await getClient();
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { progress_percentage } = body;

    if (progress_percentage === undefined) {
      return NextResponse.json(
        { success: false, error: 'Progress percentage is required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Update progress tracking
    const completionDate = parseFloat(progress_percentage) >= 100 ? new Date().toISOString().split('T')[0] : null;

    const progressResult = await client.query(
      `UPDATE progress_tracking SET
        progress_percentage = $1,
        last_accessed = NOW(),
        completion_date = $2
      WHERE enrollment_id = $3
      RETURNING *`,
      [progress_percentage, completionDate, params.enrollmentId]
    );

    if (progressResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Progress record not found' },
        { status: 404 }
      );
    }

    // Update enrollment completion percentage
    await client.query(
      `UPDATE enrollments SET
        completion_percentage = $1
      WHERE id = $2`,
      [progress_percentage, params.enrollmentId]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, data: progressResult.rows[0], message: 'Progress updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in PUT /api/progress/[enrollmentId]/update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}