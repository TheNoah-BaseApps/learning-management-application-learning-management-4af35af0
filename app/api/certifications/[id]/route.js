/**
 * @swagger
 * /api/certifications/{id}:
 *   get:
 *     summary: Get certification by ID
 *     tags: [Certifications]
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
      `SELECT cert.*, 
        e.employee_name, e.employee_id, e.department,
        c.title as course_title
       FROM certifications cert
       LEFT JOIN employees e ON cert.employee_id = e.id
       LEFT JOIN courses c ON cert.course_id = c.id
       WHERE cert.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/certifications/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certification' },
      { status: 500 }
    );
  }
}