/**
 * @swagger
 * /api/programs:
 *   get:
 *     summary: Get all programs
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create program
 *     tags: [Programs]
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
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM programs WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = $1';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
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
    const { name, description, duration, status = 'Active' } = body;

    if (!name || !duration) {
      return NextResponse.json(
        { success: false, error: 'Name and duration are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO programs (id, name, description, duration, status, created_by, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [name, description, parseInt(duration), status, user.userId]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Program created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create program' },
      { status: 500 }
    );
  }
}