import { query } from '@/lib/db';

export async function getAIRecommendations(employeeId) {
  try {
    // Get employee profile
    const employeeResult = await query(
      'SELECT * FROM employees WHERE id = $1',
      [employeeId]
    );
    
    if (employeeResult.rows.length === 0) {
      throw new Error('Employee not found');
    }
    
    const employee = employeeResult.rows[0];
    
    // Get completed courses
    const completedResult = await query(
      `SELECT c.* FROM courses c
       JOIN enrollments e ON c.id = e.course_id
       WHERE e.employee_id = $1 AND e.enrollment_status = 'Completed'`,
      [employeeId]
    );
    
    const completedCourses = completedResult.rows;
    
    // Get department-popular courses
    const departmentCoursesResult = await query(
      `SELECT c.*, COUNT(e.id) as enrollment_count
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN employees emp ON e.employee_id = emp.id
       WHERE emp.department = $1 AND c.status = 'Active'
       GROUP BY c.id
       ORDER BY enrollment_count DESC
       LIMIT 10`,
      [employee.department]
    );
    
    // Get role-based recommendations
    const roleCoursesResult = await query(
      `SELECT DISTINCT c.* FROM courses c
       WHERE c.status = 'Active' 
       AND c.description ILIKE $1
       LIMIT 5`,
      [`%${employee.designation}%`]
    );
    
    // Filter out already completed courses
    const completedIds = new Set(completedCourses.map(c => c.id));
    const departmentCourses = departmentCoursesResult.rows.filter(c => !completedIds.has(c.id));
    const roleCourses = roleCoursesResult.rows.filter(c => !completedIds.has(c.id));
    
    // Calculate recommendation scores
    const recommendations = [];
    
    // Add department-based recommendations (high priority)
    departmentCourses.forEach((course, index) => {
      recommendations.push({
        ...course,
        recommendation_score: 90 - (index * 5),
        recommendation_reason: `Popular in ${employee.department} department`,
        recommendation_type: 'department'
      });
    });
    
    // Add role-based recommendations (medium priority)
    roleCourses.forEach((course, index) => {
      if (!recommendations.find(r => r.id === course.id)) {
        recommendations.push({
          ...course,
          recommendation_score: 75 - (index * 5),
          recommendation_reason: `Relevant for ${employee.designation} role`,
          recommendation_type: 'role'
        });
      }
    });
    
    // Get trending courses (low priority)
    const trendingResult = await query(
      `SELECT c.*, COUNT(e.id) as recent_enrollments
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.status = 'Active' 
       AND e.enrollment_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY c.id
       ORDER BY recent_enrollments DESC
       LIMIT 5`
    );
    
    trendingResult.rows.forEach((course, index) => {
      if (!recommendations.find(r => r.id === course.id) && !completedIds.has(course.id)) {
        recommendations.push({
          ...course,
          recommendation_score: 60 - (index * 5),
          recommendation_reason: 'Trending course this month',
          recommendation_type: 'trending'
        });
      }
    });
    
    // Sort by score and limit to top 10
    recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);
    
    return recommendations.slice(0, 10);
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    throw error;
  }
}

export async function getPersonalizedLearningPath(employeeId) {
  try {
    const recommendations = await getAIRecommendations(employeeId);
    
    // Get employee's current progress
    const progressResult = await query(
      `SELECT e.*, c.title, c.duration, pt.progress_percentage
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN progress_tracking pt ON e.id = pt.enrollment_id
       WHERE e.employee_id = $1 AND e.enrollment_status IN ('Pending', 'Active')
       ORDER BY e.enrollment_date DESC`,
      [employeeId]
    );
    
    return {
      current_courses: progressResult.rows,
      recommended_courses: recommendations,
      learning_path: generateLearningPath(progressResult.rows, recommendations)
    };
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw error;
  }
}

function generateLearningPath(currentCourses, recommendations) {
  const path = [];
  
  // Add ongoing courses first
  currentCourses.forEach(course => {
    path.push({
      course_id: course.course_id,
      title: course.title,
      priority: 'high',
      status: 'in_progress',
      progress: course.progress_percentage || 0,
      estimated_completion: calculateEstimatedCompletion(course)
    });
  });
  
  // Add recommended courses
  recommendations.slice(0, 5).forEach((course, index) => {
    path.push({
      course_id: course.id,
      title: course.title,
      priority: index < 2 ? 'high' : 'medium',
      status: 'recommended',
      progress: 0,
      reason: course.recommendation_reason
    });
  });
  
  return path;
}

function calculateEstimatedCompletion(course) {
  try {
    const progress = parseFloat(course.progress_percentage) || 0;
    const duration = parseInt(course.duration) || 10;
    const remainingHours = (duration * (100 - progress)) / 100;
    const daysToComplete = Math.ceil(remainingHours / 2); // Assuming 2 hours per day
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToComplete);
    
    return estimatedDate.toISOString().split('T')[0];
  } catch (error) {
    return null;
  }
}