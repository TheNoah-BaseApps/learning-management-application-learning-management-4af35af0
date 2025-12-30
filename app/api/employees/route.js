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

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      user_id,
      employee_id,
      employee_name,
      first_name,
      last_name,
      email,
      department,
      designation,
      role,
      date_of_joining,
      contact_number,
      email_address,
      employment_type,
      registration_status = 'Pending'
    } = body;

    // Validate required fields with detailed error messages
    const requiredFields = [];

    // Check for first_name
    if (!first_name || typeof first_name !== 'string' || first_name.trim() === '') {
      requiredFields.push('first_name');
    }

    // Check for last_name
    if (!last_name || typeof last_name !== 'string' || last_name.trim() === '') {
      requiredFields.push('last_name');
    }

    // Check for email
    const emailField = email || email_address;
    if (!emailField || typeof emailField !== 'string' || emailField.trim() === '') {
      requiredFields.push('email');
    }

    // Check for department
    if (!department || typeof department !== 'string' || department.trim() === '') {
      requiredFields.push('department');
    }

    // Check for role
    if (!role || typeof role !== 'string' || role.trim() === '') {
      requiredFields.push('role');
    }

    if (requiredFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing or invalid required fields: ${requiredFields.join(', ')}`,
          missingFields: requiredFields
        },
        { status: 400 }
      );
    }

    // Validate employee_id if provided
    if (employee_id) {
      const validation = validateEmployeeId(employee_id);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: `Invalid employee_id: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const finalEmail = (email || email_address).trim().toLowerCase();
    if (!validateEmail(finalEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Validate employee_name if provided
    const finalEmployeeName = employee_name || `${first_name.trim()} ${last_name.trim()}`;
    const nameValidation = validateRequired(finalEmployeeName, 'Employee name');
    if (!nameValidation.valid) {
      return NextResponse.json(
        { success: false, error: nameValidation.error },
        { status: 400 }
      );
    }

    try {
      // Check for duplicate employee ID
      if (employee_id) {
        const existingEmployeeById = await query(
          'SELECT id FROM employees WHERE employee_id = $1',
          [employee_id]
        );

        if (existingEmployeeById.rows.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Employee ID already exists' },
            { status: 409 }
          );
        }
      }

      // Check for duplicate email address
      const existingEmployeeByEmail = await query(
        'SELECT id FROM employees WHERE LOWER(email_address) = $1 OR LOWER(email) = $1',
        [finalEmail]
      );

      if (existingEmployeeByEmail.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email address already exists' },
          { status: 409 }
        );
      }

      // Insert new employee with proper NULL handling
      const result = await query(
        `INSERT INTO employees (
          id,
          user_id,
          employee_id,
          employee_name,
          first_name,
          last_name,
          email,
          email_address,
          department,
          designation,
          role,
          date_of_joining,
          contact_number,
          employment_type,
          registration_status,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          NOW(),
          NOW()
        ) RETURNING *`,
        [
          user_id || null,
          employee_id || null,
          finalEmployeeName,
          first_name.trim(),
          last_name.trim(),
          finalEmail,
          finalEmail,
          department.trim(),
          designation ? designation.trim() : null,
          role.trim(),
          date_of_joining || null,
          contact_number ? contact_number.trim() : null,
          employment_type ? employment_type.trim() : null,
          registration_status
        ]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Failed to create employee - no data returned');
      }

      return NextResponse.json(
        {
          success: true,
          data: result.rows[0],
          message: 'Employee created successfully'
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database error in POST /api/employees:', dbError);
      
      // Handle specific PostgreSQL errors
      if (dbError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Duplicate entry - employee already exists' },
          { status: 409 }
        );
      }
      
      if (dbError.code === '23503') {
        return NextResponse.json(
          { success: false, error: 'Invalid reference - user_id does not exist' },
          { status: 400 }
        );
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error in POST /api/employees:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create employee',
        details: error.message
      },
      { status: 500 }
    );
  }
}