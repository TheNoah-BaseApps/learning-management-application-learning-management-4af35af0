/**
 * @swagger
 * /api/reports/employee/{id}:
 *   get:
 *     summary: Get employee learning report
 *     tags: [Reports]
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

    const [
      employeeResult,
      enrollmentsResult,
      progressResult,
      certificationsResult
    ] = await Promise.all([
      query('SELECT * FROM employees WHERE id = $1', [params.id]),
      query(`
        SELECT e.*, c.title as course_title, c.duration
        FROM enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE e.employee_id = $1
        ORDER BY e.enrollment_date DESC
      `, [params.id]),
      query(`
        SELECT AVG(progress_percentage) as avg_progress
        FROM progress_tracking
        WHERE employee_id = $1
      `, [params.id]),
      query(`
        SELECT COUNT(*) FROM certifications
        WHERE employee_id = $1
      `, [params.id])
    ]);

    if (employeeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    const report = {
      employee: employeeResult.rows[0],
      enrollments: enrollmentsResult.rows,
      total_enrollments: enrollmentsResult.rows.length,
      active_enrollments: enrollmentsResult.rows.filter(e => e.enrollment_status === 'Active').length,
      completed_enrollments: enrollmentsResult.rows.filter(e => e.enrollment_status === 'Completed').length,
      average_progress: parseFloat(progressResult.rows[0].avg_progress || 0).toFixed(1),
      total_certifications: parseInt(certificationsResult.rows[0].count) || 0
    };

    return NextResponse.json(
      { success: true, data: report },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/reports/employee/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employee report' },
      { status: 500 }
    );
  }
}