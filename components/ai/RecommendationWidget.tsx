'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, TrendingUp } from 'lucide-react';

interface Recommendation {
  id: string;
  courseId: string;
  courseName: string;
  reason: string;
  score: number;
}

export default function RecommendationWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ai/recommendations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Course Recommendations
          </CardTitle>
          <CardDescription>Personalized learning suggestions</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Course Recommendations
          </CardTitle>
          <CardDescription>Personalized learning suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchRecommendations} variant="outline" size="sm" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          AI Course Recommendations
        </CardTitle>
        <CardDescription>Personalized learning suggestions based on your profile</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations available at this time.</p>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm">{rec.courseName}</h4>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
                <Button size="sm" variant="ghost">View</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}