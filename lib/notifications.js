import { query } from '@/lib/db';

export async function createNotification(userId, message, type = 'info') {
  try {
    const result = await query(
      `INSERT INTO notifications (id, user_id, message, type, read, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
       RETURNING *`,
      [userId, message, type]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function notifyEnrollment(employeeId, courseName, enrollmentType) {
  try {
    // Get employee's user_id
    const employeeResult = await query(
      'SELECT user_id FROM employees WHERE id = $1',
      [employeeId]
    );
    
    if (employeeResult.rows.length === 0) {
      return null;
    }
    
    const userId = employeeResult.rows[0].user_id;
    
    if (!userId) {
      return null;
    }
    
    const message = `You have been enrolled in "${courseName}" (${enrollmentType})`;
    return await createNotification(userId, message, 'enrollment');
  } catch (error) {
    console.error('Error sending enrollment notification:', error);
    return null;
  }
}

export async function notifyDeadlineApproaching(employeeId, courseName, daysRemaining) {
  try {
    const employeeResult = await query(
      'SELECT user_id FROM employees WHERE id = $1',
      [employeeId]
    );
    
    if (employeeResult.rows.length === 0) {
      return null;
    }
    
    const userId = employeeResult.rows[0].user_id;
    
    if (!userId) {
      return null;
    }
    
    const message = `Course "${courseName}" deadline is approaching (${daysRemaining} days remaining)`;
    return await createNotification(userId, message, 'deadline');
  } catch (error) {
    console.error('Error sending deadline notification:', error);
    return null;
  }
}

export async function notifyAssessmentResult(employeeId, assessmentTitle, score, passed) {
  try {
    const employeeResult = await query(
      'SELECT user_id FROM employees WHERE id = $1',
      [employeeId]
    );
    
    if (employeeResult.rows.length === 0) {
      return null;
    }
    
    const userId = employeeResult.rows[0].user_id;
    
    if (!userId) {
      return null;
    }
    
    const message = passed 
      ? `Congratulations! You passed "${assessmentTitle}" with ${score}%`
      : `You scored ${score}% on "${assessmentTitle}". Keep trying!`;
    
    return await createNotification(userId, message, 'assessment');
  } catch (error) {
    console.error('Error sending assessment notification:', error);
    return null;
  }
}

export async function notifyCertification(employeeId, courseName, certificateNumber) {
  try {
    const employeeResult = await query(
      'SELECT user_id FROM employees WHERE id = $1',
      [employeeId]
    );
    
    if (employeeResult.rows.length === 0) {
      return null;
    }
    
    const userId = employeeResult.rows[0].user_id;
    
    if (!userId) {
      return null;
    }
    
    const message = `Congratulations! You earned a certificate for "${courseName}" (${certificateNumber})`;
    return await createNotification(userId, message, 'certification');
  } catch (error) {
    console.error('Error sending certification notification:', error);
    return null;
  }
}

export async function getUnreadCount(userId) {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );
    return parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

export async function markAsRead(notificationId, userId) {
  try {
    const result = await query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllAsRead(userId) {
  try {
    await query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}