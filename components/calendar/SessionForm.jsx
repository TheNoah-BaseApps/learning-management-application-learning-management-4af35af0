'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

export default function SessionForm({ session, selectedDate, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    instructor_id: '',
    type: 'online',
    start_time: '',
    end_time: '',
    location: '',
    meeting_url: '',
    max_attendees: '',
    status: 'scheduled'
  });
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        course_id: session.course_id || '',
        instructor_id: session.instructor_id || '',
        type: session.type || 'online',
        start_time: session.start_time ? format(new Date(session.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        end_time: session.end_time ? format(new Date(session.end_time), "yyyy-MM-dd'T'HH:mm") : '',
        location: session.location || '',
        meeting_url: session.meeting_url || '',
        max_attendees: session.max_attendees || '',
        status: session.status || 'scheduled'
      });
    } else if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd'T'09:00");
      setFormData(prev => ({ ...prev, start_time: dateStr }));
    }
  }, [session, selectedDate]);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/employees?role=instructor');
      if (!response.ok) throw new Error('Failed to fetch instructors');
      const data = await response.json();
      setInstructors(data.data || []);
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.title.trim()) {
      setError('Please enter a session title');
      return;
    }
    
    if (!formData.start_time) {
      setError('Please select a start time');
      return;
    }

    if (formData.end_time && new Date(formData.end_time) <= new Date(formData.start_time)) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Session Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Introduction to React"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter session details and objectives"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Select
            value={formData.course_id}
            onValueChange={(value) => handleChange('course_id', value)}
          >
            <SelectTrigger id="course">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Select
            value={formData.instructor_id}
            onValueChange={(value) => handleChange('instructor_id', value)}
          >
            <SelectTrigger id="instructor">
              <SelectValue placeholder="Select an instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors.map(instructor => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.name || instructor.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Session Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in_person">In-Person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => handleChange('start_time', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => handleChange('end_time', e.target.value)}
          />
        </div>

        {(formData.type === 'in_person' || formData.type === 'hybrid') && (
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Conference Room A"
            />
          </div>
        )}

        {(formData.type === 'online' || formData.type === 'hybrid') && (
          <div className="space-y-2">
            <Label htmlFor="meeting_url">Meeting URL</Label>
            <Input
              id="meeting_url"
              type="url"
              value={formData.meeting_url}
              onChange={(e) => handleChange('meeting_url', e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="max_attendees">Max Attendees</Label>
          <Input
            id="max_attendees"
            type="number"
            min="1"
            value={formData.max_attendees}
            onChange={(e) => handleChange('max_attendees', e.target.value)}
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
        </Button>
      </div>
    </form>
  );
}