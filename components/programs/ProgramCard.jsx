'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getStatusColor } from '@/lib/utils';
import { Clock, BookOpen } from 'lucide-react';

export default function ProgramCard({ program }) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/programs/${program.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{program.name}</CardTitle>
            <CardDescription className="mt-2">{program.description?.substring(0, 100)}{program.description?.length > 100 ? '...' : ''}</CardDescription>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(program.status)}`}>
            {program.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{program.duration} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{program.course_count || 0} courses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}