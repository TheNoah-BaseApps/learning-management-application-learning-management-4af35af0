/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { generateId } from '@/lib/utils';
import { notifyEnrollment } from '@/lib/notifications';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let sql = `
      SELECT e.*, 
        emp.employee_name, 
        c.title as course_title,
        c.duration as course_duration
      FROM enrollments e
      LEFT JOIN employees emp ON e.employee_id = emp.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (courseId) {
      paramCount++;
      sql += ` AND e.course_id = $${paramCount}`;
      params.push(courseId);
    }

    if (employeeId) {
      paramCount++;
      sql += ` AND e.employee_id = $${paramCount}`;
      params.push(employeeId);
    }

    if (status) {
      paramCount++;
      sql += ` AND e.enrollment_status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY e.created_at DESC';

    if (limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/enrollments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const client = await getClient();
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      employee_id,
      course_id,
      program_name,
      enrollment_type = 'Manual',
      product_name,
      comments
    } = body;

    if (!employee_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Course ID are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Check for duplicate active enrollment
    const existingEnrollment = await client.query(
      `SELECT id FROM enrollments 
       WHERE employee_id = $1 AND course_id = $2 
       AND enrollment_status IN ('Pending', 'Active')`,
      [employee_id, course_id]
    );

    if (existingEnrollment.rows.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Employee already enrolled in this course' },
        { status: 409 }
      );
    }

    const enrollmentId = generateId('ENR');
    const enrollmentDate = new Date().toISOString().split('T')[0];

    const enrollmentResult = await client.query(
      `INSERT INTO enrollments (
        id, enrollment_id, employee_id, course_id, program_name,
        enrollment_date, enrollment_status, enrolled_by, enrollment_type,
        product_name, comments, completion_percentage, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 'Pending', $6, $7, $8, $9, 0, NOW()
      ) RETURNING *`,
      [
        enrollmentId,
        employee_id,
        course_id,
        program_name,
        enrollmentDate,
        user.userId,
        enrollment_type,
        product_name,
        comments
      ]
    );

    // Create progress tracking record
    await client.query(
      `INSERT INTO progress_tracking (
        id, enrollment_id, employee_id, course_id, progress_percentage, last_accessed
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 0, NOW()
      )`,
      [enrollmentResult.rows[0].id, employee_id, course_id]
    );

    await client.query('COMMIT');

    // Send notification (async, don't wait)
    const courseResult = await query('SELECT title FROM courses WHERE id = $1', [course_id]);
    if (courseResult.rows.length > 0) {
      notifyEnrollment(employee_id, courseResult.rows[0].title, enrollment_type).catch(err => 
        console.error('Failed to send enrollment notification:', err)
      );
    }

    return NextResponse.json(
      { success: true, data: enrollmentResult.rows[0], message: 'Enrollment created successfully' },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/enrollments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create enrollment' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}