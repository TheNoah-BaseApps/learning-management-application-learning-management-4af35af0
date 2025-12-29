/**
 * @swagger
 * /api/progress/{employeeId}:
 *   get:
 *     summary: Get employee learning progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT pt.*, 
        c.title as course_title,
        e.enrollment_status,
        e.enrollment_date
       FROM progress_tracking pt
       LEFT JOIN courses c ON pt.course_id = c.id
       LEFT JOIN enrollments e ON pt.enrollment_id = e.id
       WHERE pt.employee_id = $1
       ORDER BY pt.last_accessed DESC`,
      [params.employeeId]
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/progress/[employeeId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}