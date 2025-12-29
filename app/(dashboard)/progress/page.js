'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ProgressTimeline from '@/components/progress/ProgressTimeline';
import ProgressBar from '@/components/progress/ProgressBar';

export default function ProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current user
      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        
        // Get employee record
        const employeeRes = await fetch(`/api/employees?user_id=${userData.user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (employeeRes.ok) {
          const employeeData = await employeeRes.json();
          if (employeeData.data && employeeData.data.length > 0) {
            const employee = employeeData.data[0];
            
            // Get progress
            const progressRes = await fetch(`/api/progress/${employee.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              setProgressData(progressData.data || []);
            }
          }
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress data');
      toast.error('Failed to load progress data');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Learning Progress</h1>
        <p className="text-gray-600 mt-1">Track your course completion and milestones</p>
      </div>

      {progressData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No active enrollments to track</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressData.map((progress) => (
              <Card key={progress.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{progress.course_title || 'Course'}</CardTitle>
                  <CardDescription>
                    Last accessed: {progress.last_accessed ? new Date(progress.last_accessed).toLocaleDateString() : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressBar 
                    percentage={progress.progress_percentage || 0} 
                    showLabel={true}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
              <CardDescription>Your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressTimeline progressData={progressData} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}