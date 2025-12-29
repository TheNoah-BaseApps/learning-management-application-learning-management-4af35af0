'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Video } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const SESSION_TYPES = {
  online: { label: 'Online', color: 'bg-blue-100 text-blue-800', icon: Video },
  in_person: { label: 'In-Person', color: 'bg-green-100 text-green-800', icon: MapPin },
  hybrid: { label: 'Hybrid', color: 'bg-purple-100 text-purple-800', icon: Users }
};

export default function CalendarView({ sessions = [], onDateSelect, onSessionClick, onAddSession }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time || session.date);
      return isSameDay(sessionDate, date);
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handlePrevious = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getDayClasses = (day) => {
    const classes = ['p-2 border cursor-pointer transition-colors min-h-[100px]'];
    
    if (!isSameMonth(day, currentDate)) {
      classes.push('bg-gray-50 text-gray-400');
    } else {
      classes.push('hover:bg-gray-50');
    }
    
    if (isSameDay(day, new Date())) {
      classes.push('bg-blue-50 border-blue-500');
    }
    
    if (isSameDay(day, selectedDate)) {
      classes.push('ring-2 ring-primary');
    }
    
    return classes.join(' ');
  };

  const selectedDateSessions = getSessionsForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {onAddSession && (
                  <Button onClick={() => onAddSession(selectedDate)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Session
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center font-semibold text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map(day => {
                const daySessions = getSessionsForDate(day);
                
                return (
                  <div
                    key={day.toString()}
                    className={getDayClasses(day)}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="font-semibold mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map(session => {
                        const typeConfig = SESSION_TYPES[session.type] || SESSION_TYPES.online;
                        
                        return (
                          <div
                            key={session.id}
                            className={`text-xs p-1 rounded truncate ${typeConfig.color} cursor-pointer hover:opacity-80`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSessionClick) onSessionClick(session);
                            }}
                          >
                            {session.start_time && format(new Date(session.start_time), 'HH:mm')} {session.title}
                          </div>
                        );
                      })}
                      {daySessions.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{daySessions.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Sessions */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sessions scheduled</p>
                {onAddSession && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => onAddSession(selectedDate)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Session
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateSessions.map(session => {
                  const typeConfig = SESSION_TYPES[session.type] || SESSION_TYPES.online;
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <div
                      key={session.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSessionClick && onSessionClick(session)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{session.title}</h4>
                        <Badge variant="outline" className={`${typeConfig.color} text-xs`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                      </div>
                      
                      {session.start_time && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.start_time), 'HH:mm')}
                          {session.end_time && ` - ${format(new Date(session.end_time), 'HH:mm')}`}
                        </div>
                      )}
                      
                      {session.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </div>
                      )}
                      
                      {session.instructor_name && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {session.instructor_name}
                        </div>
                      )}
                      
                      {session.attendees_count !== undefined && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {session.attendees_count} / {session.max_attendees || '∞'} attendees
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}