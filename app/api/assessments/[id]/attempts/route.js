/**
 * @swagger
 * /api/assessments/{id}/attempts:
 *   get:
 *     summary: Get assessment attempts
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Submit assessment attempt
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';
import { notifyAssessmentResult, notifyCertification } from '@/lib/notifications';

export async function GET(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT aa.*, e.employee_name
       FROM assessment_attempts aa
       LEFT JOIN employees e ON aa.employee_id = e.id
       WHERE aa.assessment_id = $1
       ORDER BY aa.attempted_at DESC`,
      [params.id]
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/assessments/[id]/attempts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const client = await getClient();
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { employee_id, score } = body;

    if (!employee_id || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and score are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Get assessment details
    const assessmentResult = await client.query(
      'SELECT * FROM assessments WHERE id = $1',
      [params.id]
    );

    if (assessmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const assessment = assessmentResult.rows[0];
    const passed = parseFloat(score) >= parseFloat(assessment.passing_score);
    const status = passed ? 'Passed' : 'Failed';

    // Create attempt record
    const attemptResult = await client.query(
      `INSERT INTO assessment_attempts (
        id, assessment_id, employee_id, score, status, attempted_at, completed_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()
      ) RETURNING *`,
      [params.id, employee_id, score, status]
    );

    // If passed, check if should issue certificate
    if (passed) {
      const enrollmentResult = await client.query(
        `SELECT e.* FROM enrollments e
         WHERE e.employee_id = $1 AND e.course_id = $2
         AND e.enrollment_status = 'Active'
         LIMIT 1`,
        [employee_id, assessment.course_id]
      );

      if (enrollmentResult.rows.length > 0) {
        // Update enrollment to completed
        await client.query(
          `UPDATE enrollments 
           SET enrollment_status = 'Completed', completion_percentage = 100
           WHERE id = $1`,
          [enrollmentResult.rows[0].id]
        );

        // Issue certificate
        const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const issueDate = new Date().toISOString().split('T')[0];
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);

        await client.query(
          `INSERT INTO certifications (
            id, employee_id, course_id, certificate_number, issue_date, expiry_date, status, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, 'Active', NOW()
          )`,
          [employee_id, assessment.course_id, certNumber, issueDate, expiryDate.toISOString().split('T')[0]]
        );

        // Send certification notification
        const courseResult = await client.query('SELECT title FROM courses WHERE id = $1', [assessment.course_id]);
        if (courseResult.rows.length > 0) {
          notifyCertification(employee_id, courseResult.rows[0].title, certNumber).catch(err =>
            console.error('Failed to send certification notification:', err)
          );
        }
      }
    }

    await client.query('COMMIT');

    // Send assessment result notification
    notifyAssessmentResult(employee_id, assessment.title, score, passed).catch(err =>
      console.error('Failed to send assessment notification:', err)
    );

    return NextResponse.json(
      { 
        success: true, 
        data: attemptResult.rows[0], 
        message: passed ? 'Congratulations! You passed!' : 'Assessment completed'
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/assessments/[id]/attempts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit attempt' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}