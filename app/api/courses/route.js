/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { generateId } from '@/lib/utils';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('program_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT c.*, p.name as program_name
      FROM courses c
      LEFT JOIN programs p ON c.program_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (programId) {
      paramCount++;
      sql += ` AND c.program_id = $${paramCount}`;
      params.push(programId);
    }

    if (status) {
      paramCount++;
      sql += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY c.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
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
      program_id,
      title,
      description,
      duration,
      content_url,
      status = 'Active'
    } = body;

    if (!title || !duration) {
      return NextResponse.json(
        { success: false, error: 'Title and duration are required' },
        { status: 400 }
      );
    }

    const courseId = generateId('CRS');

    const result = await query(
      `INSERT INTO courses (
        id, course_id, program_id, title, description, duration, content_url, status, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
      ) RETURNING *`,
      [courseId, program_id, title, description, parseInt(duration), content_url, status]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Course created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}