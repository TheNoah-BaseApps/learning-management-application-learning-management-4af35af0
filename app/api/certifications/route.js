/**
 * @swagger
 * /api/certifications:
 *   get:
 *     summary: Get all certifications
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Generate certification
 *     tags: [Certifications]
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
    const employeeId = searchParams.get('employee_id');
    const courseId = searchParams.get('course_id');

    let sql = `
      SELECT cert.*, 
        e.employee_name,
        c.title as course_title
      FROM certifications cert
      LEFT JOIN employees e ON cert.employee_id = e.id
      LEFT JOIN courses c ON cert.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (employeeId) {
      paramCount++;
      sql += ` AND cert.employee_id = $${paramCount}`;
      params.push(employeeId);
    }

    if (courseId) {
      paramCount++;
      sql += ` AND cert.course_id = $${paramCount}`;
      params.push(courseId);
    }

    sql += ' ORDER BY cert.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/certifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certifications' },
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
    const { employee_id, course_id, expiry_years = 2 } = body;

    if (!employee_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Course ID are required' },
        { status: 400 }
      );
    }

    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + expiry_years);

    const result = await query(
      `INSERT INTO certifications (
        id, employee_id, course_id, certificate_number, issue_date, expiry_date, status, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 'Active', NOW()
      ) RETURNING *`,
      [employee_id, course_id, certNumber, issueDate, expiryDate.toISOString().split('T')[0]]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Certification generated successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/certifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate certification' },
      { status: 500 }
    );
  }
}