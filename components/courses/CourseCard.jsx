'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { getStatusColor, formatDuration } from '@/lib/utils';
import { Clock, BookOpen } from 'lucide-react';

export default function CourseCard({ course }) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/courses/${course.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="mt-2">{course.description?.substring(0, 80)}{course.description?.length > 80 ? '...' : ''}</CardDescription>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(course.status)}`}>
            {course.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          {course.program_name && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.program_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}