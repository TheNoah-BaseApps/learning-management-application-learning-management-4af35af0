export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= 8;
}

export function validateRequired(value, fieldName = 'Field') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateEmployeeId(employeeId) {
  if (!employeeId || typeof employeeId !== 'string') {
    return { valid: false, error: 'Employee ID is required' };
  }
  if (employeeId.length < 3) {
    return { valid: false, error: 'Employee ID must be at least 3 characters' };
  }
  return { valid: true };
}

export function validateEnrollmentType(type) {
  const validTypes = ['Mandatory', 'Optional', 'Self-Enrolled'];
  if (!validTypes.includes(type)) {
    return { valid: false, error: 'Invalid enrollment type' };
  }
  return { valid: true };
}

export function validateEnrollmentStatus(status) {
  const validStatuses = ['Pending', 'Active', 'Completed', 'Cancelled', 'Expired'];
  if (!validStatuses.includes(status)) {
    return { valid: false, error: 'Invalid enrollment status' };
  }
  return { valid: true };
}

export function validateRegistrationStatus(status) {
  const validStatuses = ['Pending', 'Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return { valid: false, error: 'Invalid registration status' };
  }
  return { valid: true };
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Start and end dates are required' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { valid: false, error: 'End date must be after start date' };
  }
  
  return { valid: true };
}

export function validatePercentage(value) {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0 || num > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }
  return { valid: true };
}

export function validateScore(score, totalPoints) {
  const scoreNum = parseFloat(score);
  const totalNum = parseFloat(totalPoints);
  
  if (isNaN(scoreNum) || scoreNum < 0) {
    return { valid: false, error: 'Score must be a positive number' };
  }
  
  if (scoreNum > totalNum) {
    return { valid: false, error: 'Score cannot exceed total points' };
  }
  
  return { valid: true };
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return input.trim().replace(/[<>]/g, '');
}