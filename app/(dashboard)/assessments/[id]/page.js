'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import AssessmentInterface from '@/components/assessments/AssessmentInterface';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [params.id]);

  async function fetchAssessmentDetails() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch assessment details (would need to implement GET endpoint)
      const assessmentRes = await fetch(`/api/assessments?id=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (assessmentRes.ok) {
        const assessmentData = await assessmentRes.json();
        const foundAssessment = assessmentData.data?.find(a => a.id === params.id);
        setAssessment(foundAssessment);
      }

      // Fetch attempts
      const attemptsRes = await fetch(`/api/assessments/${params.id}/attempts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json();
        setAttempts(attemptsData.data || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment details');
      toast.error('Failed to load assessment details');
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

  if (error || !assessment) {
    return <ErrorMessage message={error || 'Assessment not found'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <p className="text-gray-600 mt-1">Assessment</p>
        </div>
      </div>

      <AssessmentInterface 
        assessment={assessment} 
        onComplete={() => fetchAssessmentDetails()}
      />

      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Attempts</CardTitle>
            <CardDescription>{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.map((attempt, index) => (
                <div key={attempt.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">Attempt {attempts.length - index}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(attempt.attempted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{attempt.score}%</p>
                    <p className={`text-sm ${attempt.status === 'Passed' ? 'text-green-600' : 'text-red-600'}`}>
                      {attempt.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}