'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import EnrollmentTable from '@/components/enrollments/EnrollmentTable';
import EnrollmentForm from '@/components/enrollments/EnrollmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EnrollmentsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowAddModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enrollments</h1>
          <p className="text-gray-600 mt-1">Manage employee course enrollments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Enroll Employee
        </Button>
      </div>

      <EnrollmentTable key={refreshKey} />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Enrollment</DialogTitle>
          </DialogHeader>
          <EnrollmentForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}