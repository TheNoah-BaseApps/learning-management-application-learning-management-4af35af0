'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import CourseCard from '@/components/courses/CourseCard';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current user
      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        
        // Get employee record
        const employeeRes = await fetch(`/api/employees?user_id=${userData.user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (employeeRes.ok) {
          const employeeData = await employeeRes.json();
          if (employeeData.data && employeeData.data.length > 0) {
            const employee = employeeData.data[0];
            
            // Get recommendations
            const recsRes = await fetch(`/api/ai/recommendations/${employee.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (recsRes.ok) {
              const recsData = await recsRes.json();
              setRecommendations(recsData.data || []);
            }
          }
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      toast.error('Failed to load recommendations');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            AI Recommendations
          </h1>
          <p className="text-gray-600 mt-1">Personalized course suggestions based on your profile and interests</p>
        </div>
        <Button onClick={fetchRecommendations} variant="outline">
          Refresh
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No recommendations available at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="relative">
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {rec.recommendation_score}% Match
                </div>
              </div>
              <CourseCard course={rec} />
              <p className="mt-2 text-sm text-gray-600 italic">
                {rec.recommendation_reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}