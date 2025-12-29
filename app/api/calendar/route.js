/**
 * @swagger
 * /api/calendar:
 *   get:
 *     summary: Get learning calendar
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Schedule course session
 *     tags: [Calendar]
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

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming');
    const courseId = searchParams.get('course_id');

    let sql = `
      SELECT lc.*, c.title as course_title
      FROM learning_calendar lc
      LEFT JOIN courses c ON lc.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (upcoming === 'true') {
      sql += ` AND lc.scheduled_date >= CURRENT_DATE`;
    }

    if (courseId) {
      paramCount++;
      sql += ` AND lc.course_id = $${paramCount}`;
      params.push(courseId);
    }

    sql += ' ORDER BY lc.scheduled_date ASC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/calendar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, scheduled_date, end_date, max_participants, status = 'Scheduled' } = body;

    if (!course_id || !scheduled_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Course ID, scheduled date, and end date are required' },
        { status: 400 }
      );
    }

    if (new Date(scheduled_date) > new Date(end_date)) {
      return NextResponse.json(
        { success: false, error: 'End date must be after scheduled date' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO learning_calendar (
        id, course_id, scheduled_date, end_date, max_participants, status, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, NOW()
      ) RETURNING *`,
      [course_id, scheduled_date, end_date, max_participants, status]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Session scheduled successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/calendar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule session' },
      { status: 500 }
    );
  }
}