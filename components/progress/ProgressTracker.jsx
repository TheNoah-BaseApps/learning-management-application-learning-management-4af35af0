'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Lock, Clock, Award, BookOpen, PlayCircle } from 'lucide-react';

export default function ProgressTracker({ enrollment, modules = [] }) {
  const completedModules = modules.filter(m => m.status === 'completed').length;
  const totalModules = modules.length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  const getModuleIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-blue-500" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { label: 'Completed', variant: 'default', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
      locked: { label: 'Locked', variant: 'outline', color: 'bg-gray-100 text-gray-800' },
      not_started: { label: 'Not Started', variant: 'outline', color: 'bg-gray-100 text-gray-600' }
    };
    
    const statusConfig = config[status] || config.not_started;
    
    return (
      <Badge variant="outline" className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>
                {enrollment?.course_title || 'Course Progress Tracking'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-muted-foreground">
                {completedModules} of {totalModules} modules
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          
          {enrollment && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{totalModules}</div>
                <div className="text-xs text-muted-foreground">Total Modules</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{completedModules}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{enrollment.hours_spent || 0}</div>
                <div className="text-xs text-muted-foreground">Hours Spent</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{enrollment.score || 0}%</div>
                <div className="text-xs text-muted-foreground">Current Score</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
          <CardDescription>Track your progress through each module</CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No modules available
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getModuleIcon(module.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">
                        Module {index + 1}: {module.title}
                      </h4>
                      {getStatusBadge(module.status)}
                    </div>
                    
                    {module.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {module.description}
                      </p>
                    )}
                    
                    {module.progress !== undefined && module.status === 'in_progress' && (
                      <div className="mt-2">
                        <Progress value={module.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    {module.duration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {module.duration} min
                      </div>
                    )}
                    {module.score !== undefined && module.status === 'completed' && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        Score: {module.score}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Path */}
      {modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Path</CardTitle>
            <CardDescription>Your journey through this course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={module.id} className="relative flex items-start gap-4">
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center ${
                      module.status === 'completed' 
                        ? 'bg-green-500' 
                        : module.status === 'in_progress'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}>
                      {module.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-white font-semibold">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <h4 className="font-semibold mb-1">{module.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {module.description || 'No description available'}
                      </p>
                      
                      {module.completed_at && (
                        <div className="text-xs text-muted-foreground">
                          Completed on {new Date(module.completed_at).toLocaleDateString()}
                        </div>
                      )}
                      
                      {module.status === 'in_progress' && module.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}