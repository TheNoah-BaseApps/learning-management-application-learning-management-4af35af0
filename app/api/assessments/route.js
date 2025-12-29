/**
 * @swagger
 * /api/assessments:
 *   get:
 *     summary: Get all assessments
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create assessment
 *     tags: [Assessments]
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
    const courseId = searchParams.get('course_id');
    const assessmentId = searchParams.get('id');

    let sql = `
      SELECT a.*, c.title as course_title
      FROM assessments a
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (courseId) {
      paramCount++;
      sql += ` AND a.course_id = $${paramCount}`;
      params.push(courseId);
    }

    if (assessmentId) {
      paramCount++;
      sql += ` AND a.id = $${paramCount}`;
      params.push(assessmentId);
    }

    sql += ' ORDER BY a.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
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
    const {
      course_id,
      title,
      description,
      passing_score,
      total_points,
      duration_minutes
    } = body;

    if (!course_id || !title || !passing_score || !total_points) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO assessments (
        id, course_id, title, description, passing_score, total_points, duration_minutes, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()
      ) RETURNING *`,
      [course_id, title, description, passing_score, total_points, duration_minutes]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Assessment created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}