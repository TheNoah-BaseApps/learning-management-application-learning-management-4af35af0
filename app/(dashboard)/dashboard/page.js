'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Award, TrendingUp, Calendar, Bell } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import RecommendationWidget from '@/components/ai/RecommendationWidget';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch current user
      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch overview stats
      const statsRes = await fetch('/api/reports/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch recent enrollments
      const enrollmentsRes = await fetch('/api/enrollments?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setRecentActivity(enrollmentsData.data || []);
      }

      // Fetch upcoming calendar events
      const calendarRes = await fetch('/api/calendar?upcoming=true', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (calendarRes.ok) {
        const calendarData = await calendarRes.json();
        setUpcomingDeadlines(calendarData.data || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.total_employees || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Courses',
      value: stats?.active_courses || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Enrollments',
      value: stats?.total_enrollments || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Certifications',
      value: stats?.total_certifications || 0,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest enrollment updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{enrollment.product_name || enrollment.course_title || 'Course'}</p>
                        <p className="text-sm text-gray-600">
                          {enrollment.employee_name || 'Employee'} • {formatDate(enrollment.enrollment_date)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        enrollment.enrollment_status === 'Active' ? 'bg-green-100 text-green-800' :
                        enrollment.enrollment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.enrollment_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 3).map((session) => (
                    <div key={session.id} className="border-l-4 border-blue-500 pl-3">
                      <p className="font-medium text-sm">{session.course_title || 'Session'}</p>
                      <p className="text-xs text-gray-600">{formatDate(session.scheduled_date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {user?.id && (
            <RecommendationWidget userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}