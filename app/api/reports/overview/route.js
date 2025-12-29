/**
 * @swagger
 * /api/reports/overview:
 *   get:
 *     summary: Get learning analytics overview
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [
      employeesResult,
      coursesResult,
      enrollmentsResult,
      certificationsResult,
      completionResult
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM employees'),
      query("SELECT COUNT(*) FROM courses WHERE status = 'Active'"),
      query('SELECT COUNT(*) FROM enrollments'),
      query('SELECT COUNT(*) FROM certifications'),
      query("SELECT COUNT(*) FROM enrollments WHERE enrollment_status = 'Completed'")
    ]);

    const totalEnrollments = parseInt(enrollmentsResult.rows[0].count) || 0;
    const completedEnrollments = parseInt(completionResult.rows[0].count) || 0;
    const completionRate = totalEnrollments > 0 
      ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1)
      : 0;

    const overview = {
      total_employees: parseInt(employeesResult.rows[0].count) || 0,
      active_courses: parseInt(coursesResult.rows[0].count) || 0,
      total_enrollments: totalEnrollments,
      total_certifications: parseInt(certificationsResult.rows[0].count) || 0,
      completion_rate: parseFloat(completionRate)
    };

    return NextResponse.json(
      { success: true, data: overview },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/reports/overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview' },
      { status: 500 }
    );
  }
}