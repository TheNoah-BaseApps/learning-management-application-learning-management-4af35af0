/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Cancel enrollment
 *     tags: [Enrollments]
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
      `SELECT e.*, 
        emp.employee_name, 
        c.title as course_title,
        c.duration as course_duration
       FROM enrollments e
       LEFT JOIN employees emp ON e.employee_id = emp.id
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/enrollments/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollment_status, comments, completion_percentage } = body;

    const result = await query(
      `UPDATE enrollments SET
        enrollment_status = COALESCE($1, enrollment_status),
        comments = COALESCE($2, comments),
        completion_percentage = COALESCE($3, completion_percentage)
      WHERE id = $4
      RETURNING *`,
      [enrollment_status, comments, completion_percentage, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Enrollment updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/enrollments/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `UPDATE enrollments SET enrollment_status = 'Cancelled' 
       WHERE id = $1 RETURNING *`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Enrollment cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/enrollments/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel enrollment' },
      { status: 500 }
    );
  }
}