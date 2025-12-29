'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Users, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import CourseForm from '@/components/courses/CourseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDuration, getStatusColor } from '@/lib/utils';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [params.id]);

  async function fetchCourseDetails() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [courseRes, enrollmentsRes] = await Promise.all([
        fetch(`/api/courses/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/enrollments?course_id=${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!courseRes.ok) {
        throw new Error('Failed to fetch course');
      }

      const courseData = await courseRes.json();
      setCourse(courseData.data);

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData.data || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete course');
      }

      toast.success('Course deleted successfully');
      router.push('/courses');
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Failed to delete course');
    }
  }

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    fetchCourseDetails();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !course) {
    return <ErrorMessage message={error || 'Course not found'} />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-gray-600 mt-1">Course Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(course.duration)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Course ID</label>
              <p className="mt-1 font-mono text-sm">{course.course_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="mt-1">{course.description || 'No description provided'}</p>
            </div>
            {course.content_url && (
              <div>
                <label className="text-sm font-medium text-gray-600">Content URL</label>
                <a 
                  href={course.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-2 text-blue-600 hover:underline"
                >
                  {course.content_url}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            {course.program_name && (
              <div>
                <label className="text-sm font-medium text-gray-600">Program</label>
                <p className="mt-1 font-medium">{course.program_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>{enrollments.length} total enrollment{enrollments.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {enrollments.slice(0, 5).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{enrollment.employee_name || 'Employee'}</p>
                      <p className="text-sm text-gray-600">{enrollment.enrollment_type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(enrollment.enrollment_status)}`}>
                      {enrollment.enrollment_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <CourseForm course={course} onSuccess={handleUpdateSuccess} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {course.title}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}