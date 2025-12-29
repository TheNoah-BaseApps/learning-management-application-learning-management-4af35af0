/**
 * @swagger
 * /api/reports/course/{id}:
 *   get:
 *     summary: Get course analytics
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
      courseResult,
      enrollmentsResult,
      progressResult,
      assessmentResult
    ] = await Promise.all([
      query('SELECT * FROM courses WHERE id = $1', [params.id]),
      query(`
        SELECT e.*, emp.employee_name, emp.department
        FROM enrollments e
        LEFT JOIN employees emp ON e.employee_id = emp.id
        WHERE e.course_id = $1
        ORDER BY e.enrollment_date DESC
      `, [params.id]),
      query(`
        SELECT AVG(progress_percentage) as avg_progress
        FROM progress_tracking
        WHERE course_id = $1
      `, [params.id]),
      query(`
        SELECT a.*, COUNT(aa.id) as total_attempts, AVG(aa.score) as avg_score
        FROM assessments a
        LEFT JOIN assessment_attempts aa ON a.id = aa.assessment_id
        WHERE a.course_id = $1
        GROUP BY a.id
      `, [params.id])
    ]);

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const analytics = {
      course: courseResult.rows[0],
      enrollments: enrollmentsResult.rows,
      total_enrollments: enrollmentsResult.rows.length,
      active_enrollments: enrollmentsResult.rows.filter(e => e.enrollment_status === 'Active').length,
      completed_enrollments: enrollmentsResult.rows.filter(e => e.enrollment_status === 'Completed').length,
      average_progress: parseFloat(progressResult.rows[0].avg_progress || 0).toFixed(1),
      assessments: assessmentResult.rows,
      completion_rate: enrollmentsResult.rows.length > 0
        ? ((enrollmentsResult.rows.filter(e => e.enrollment_status === 'Completed').length / enrollmentsResult.rows.length) * 100).toFixed(1)
        : 0
    };

    return NextResponse.json(
      { success: true, data: analytics },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/reports/course/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course analytics' },
      { status: 500 }
    );
  }
}