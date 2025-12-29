'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Award, BookOpen, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ProgressTimeline({ activities = [] }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'module_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'assessment_passed':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'course_completed':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityBadge = (type) => {
    const config = {
      enrollment: { label: 'Enrolled', color: 'bg-blue-100 text-blue-800' },
      module_completed: { label: 'Module Complete', color: 'bg-green-100 text-green-800' },
      assessment_passed: { label: 'Assessment Passed', color: 'bg-purple-100 text-purple-800' },
      assessment_failed: { label: 'Assessment Failed', color: 'bg-red-100 text-red-800' },
      course_completed: { label: 'Course Complete', color: 'bg-emerald-100 text-emerald-800' },
      certificate_issued: { label: 'Certificate Issued', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const badgeConfig = config[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={badgeConfig.color}>
        {badgeConfig.label}
      </Badge>
    );
  };

  const groupActivitiesByDate = () => {
    const grouped = {};
    
    activities.forEach(activity => {
      const date = activity.timestamp 
        ? format(parseISO(activity.timestamp), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd');
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  const groupedActivities = groupActivitiesByDate();

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-muted-foreground text-center">
            No activity to display yet. Start learning to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Your recent learning activities and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {groupedActivities.map(([date, dateActivities]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>
              
              <div className="relative ml-6 space-y-6">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                {dateActivities.map((activity, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div className="absolute -left-[13px] z-10 flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 ml-6 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{activity.title}</h4>
                            {getActivityBadge(activity.type)}
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        
                        {activity.timestamp && (
                          <span className="text-xs text-muted-foreground ml-4">
                            {format(parseISO(activity.timestamp), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      
                      {/* Additional Details */}
                      {activity.details && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          {activity.details.score !== undefined && (
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Score:</span>
                              <span className={`font-semibold ${
                                activity.details.score >= 70 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {activity.details.score}%
                              </span>
                            </div>
                          )}
                          
                          {activity.details.duration && (
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{activity.details.duration} min</span>
                            </div>
                          )}
                          
                          {activity.details.points && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Points Earned:</span>
                              <span className="font-medium text-purple-600">
                                +{activity.details.points}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Course/Module Info */}
                      {(activity.course_title || activity.module_title) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {activity.course_title && (
                            <Badge variant="outline" className="bg-white">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {activity.course_title}
                            </Badge>
                          )}
                          {activity.module_title && (
                            <Badge variant="outline" className="bg-white">
                              {activity.module_title}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}