'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProgramTable from '@/components/programs/ProgramTable';
import ProgramForm from '@/components/programs/ProgramForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ProgramsPage() {
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
          <h1 className="text-3xl font-bold">Learning Programs</h1>
          <p className="text-gray-600 mt-1">Organize courses into structured learning programs</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
      </div>

      <ProgramTable key={refreshKey} />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
          </DialogHeader>
          <ProgramForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}