'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Award, BookOpen, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  enrolled: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: BookOpen,
    label: 'Enrolled'
  },
  in_progress: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    label: 'In Progress'
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    label: 'Completed'
  },
  dropped: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: 'Dropped'
  },
  expired: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle,
    label: 'Expired'
  }
};

export default function EnrollmentCard({ enrollment, onView, onUpdate, onDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const statusConfig = STATUS_CONFIG[enrollment?.status] || STATUS_CONFIG.enrolled;
  const StatusIcon = statusConfig.icon;
  
  const progress = enrollment?.progress || 0;
  const completedAt = enrollment?.completed_at ? new Date(enrollment.completed_at) : null;
  const enrolledAt = enrollment?.enrolled_at ? new Date(enrollment.enrolled_at) : new Date();
  const expiresAt = enrollment?.expires_at ? new Date(enrollment.expires_at) : null;

  const handleStatusUpdate = async (newStatus) => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(enrollment.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update enrollment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getDaysRemaining = () => {
    if (!expiresAt) return null;
    const today = new Date();
    const diffTime = expiresAt - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              {enrollment?.course_title || 'Course Title'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {enrollment?.employee_name || 'Employee Name'}
            </CardDescription>
          </div>
          <Badge variant="outline" className={statusConfig.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Enrollment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Enrolled
            </div>
            <div className="font-medium">
              {format(enrolledAt, 'MMM dd, yyyy')}
            </div>
          </div>

          {completedAt && (
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <Award className="h-4 w-4 mr-2" />
                Completed
              </div>
              <div className="font-medium">
                {format(completedAt, 'MMM dd, yyyy')}
              </div>
            </div>
          )}

          {expiresAt && !completedAt && (
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Expires
              </div>
              <div className={`font-medium ${daysRemaining && daysRemaining < 7 ? 'text-red-600' : ''}`}>
                {daysRemaining !== null && daysRemaining >= 0 
                  ? `${daysRemaining} days left`
                  : format(expiresAt, 'MMM dd, yyyy')}
              </div>
            </div>
          )}
        </div>

        {/* Course Details */}
        {enrollment?.course_description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {enrollment.course_description}
            </p>
          </div>
        )}

        {/* Additional Metrics */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          {enrollment?.modules_completed !== undefined && enrollment?.total_modules && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {enrollment.modules_completed}/{enrollment.total_modules} modules
            </div>
          )}
          {enrollment?.score !== undefined && enrollment?.score !== null && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Score: {enrollment.score}%
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {enrollment?.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
          {enrollment?.status === 'enrolled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating}
            >
              Start Course
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(enrollment)}
            >
              View Details
            </Button>
          )}
          {onDelete && enrollment?.status !== 'completed' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(enrollment.id)}
              disabled={isUpdating}
            >
              Remove
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}