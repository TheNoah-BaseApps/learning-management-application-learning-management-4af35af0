'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EnrollmentCard from '@/components/enrollments/EnrollmentCard';
import EnrollmentForm from '@/components/enrollments/EnrollmentForm';
import ProgressTracker from '@/components/progress/ProgressTracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function EnrollmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchEnrollment();
  }, [params.id]);

  async function fetchEnrollment() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/enrollments/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch enrollment');
      }

      const data = await res.json();
      setEnrollment(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching enrollment:', err);
      setError('Failed to load enrollment details');
      toast.error('Failed to load enrollment details');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/enrollments/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to cancel enrollment');
      }

      toast.success('Enrollment cancelled successfully');
      router.push('/enrollments');
    } catch (err) {
      console.error('Error cancelling enrollment:', err);
      toast.error('Failed to cancel enrollment');
    }
  }

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    fetchEnrollment();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !enrollment) {
    return <ErrorMessage message={error || 'Enrollment not found'} />;
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
              <h1 className="text-3xl font-bold">Enrollment Details</h1>
              <p className="text-gray-600 mt-1">{enrollment.enrollment_id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        <EnrollmentCard enrollment={enrollment} />

        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker 
              enrollmentId={enrollment.id}
              employeeId={enrollment.employee_id}
              courseId={enrollment.course_id}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>
          <EnrollmentForm enrollment={enrollment} onSuccess={handleUpdateSuccess} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this enrollment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Enrollment</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Cancel Enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}