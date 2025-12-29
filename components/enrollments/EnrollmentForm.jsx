'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EnrollmentForm({ enrollment, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: enrollment?.employee_id || '',
    course_id: enrollment?.course_id || '',
    enrollment_type: enrollment?.enrollment_type || 'Manual',
    comments: enrollment?.comments || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem('token');
      const [empRes, courseRes] = await Promise.all([
        fetch('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.data || []);
      }

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = enrollment ? `/api/enrollments/${enrollment.id}` : '/api/enrollments';
      const method = enrollment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save enrollment');
      }

      toast.success(enrollment ? 'Enrollment updated successfully' : 'Enrollment created successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving enrollment:', error);
      toast.error(error.message || 'Failed to save enrollment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employee_id">Employee</Label>
        <Select 
          value={formData.employee_id} 
          onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
          disabled={!!enrollment}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.employee_name} ({emp.employee_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="course_id">Course</Label>
        <Select 
          value={formData.course_id} 
          onValueChange={(value) => setFormData({ ...formData, course_id: value })}
          disabled={!!enrollment}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enrollment_type">Enrollment Type</Label>
        <Select value={formData.enrollment_type} onValueChange={(value) => setFormData({ ...formData, enrollment_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mandatory">Mandatory</SelectItem>
            <SelectItem value="Optional">Optional</SelectItem>
            <SelectItem value="Self-Enrolled">Self-Enrolled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {enrollment ? 'Update Enrollment' : 'Create Enrollment'}
      </Button>
    </form>
  );
}