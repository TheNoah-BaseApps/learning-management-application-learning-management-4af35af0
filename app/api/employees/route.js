/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { validateEmployeeId, validateEmail, validateRequired } from '@/lib/validation';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      sql += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    if (department) {
      paramCount++;
      sql += ` AND department = $${paramCount}`;
      params.push(department);
    }

    if (status) {
      paramCount++;
      sql += ` AND registration_status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
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
      user_id,
      employee_id,
      employee_name,
      department,
      designation,
      date_of_joining,
      contact_number,
      email_address,
      employment_type,
      registration_status = 'Pending'
    } = body;

    // Validate required fields
    const validation = validateEmployeeId(employee_id);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    if (!validateEmail(email_address)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    const nameValidation = validateRequired(employee_name, 'Employee name');
    if (!nameValidation.valid) {
      return NextResponse.json({ success: false, error: nameValidation.error }, { status: 400 });
    }

    // Check for duplicate employee ID
    const existingEmployee = await query(
      'SELECT id FROM employees WHERE employee_id = $1',
      [employee_id]
    );

    if (existingEmployee.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Employee ID already exists' },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO employees (
        id, user_id, employee_id, employee_name, department, designation,
        date_of_joining, contact_number, email_address, employment_type,
        registration_status, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
      ) RETURNING *`,
      [
        user_id || null,
        employee_id,
        employee_name,
        department,
        designation,
        date_of_joining,
        contact_number,
        email_address,
        employment_type,
        registration_status
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0], message: 'Employee created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}