'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EnrollmentTable() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'enrollment_id', label: 'Enrollment ID' },
    { key: 'employee_name', label: 'Employee' },
    { key: 'course_title', label: 'Course' },
    { key: 'enrollment_type', label: 'Type' },
    {
      key: 'enrollment_status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'completion_percentage',
      label: 'Progress',
      render: (value) => `${value || 0}%`
    },
    {
      key: 'enrollment_date',
      label: 'Enrolled',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => router.push(`/enrollments/${row.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return <DataTable columns={columns} data={enrollments} loading={loading} />;
}