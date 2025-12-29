'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { formatDate, formatDuration, getStatusColor } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CourseTable() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'course_id', label: 'Course ID' },
    { key: 'title', label: 'Title' },
    { key: 'program_name', label: 'Program' },
    { key: 'duration', label: 'Duration', render: (value) => formatDuration(value) },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => router.push(`/courses/${row.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return <DataTable columns={columns} data={courses} loading={loading} />;
}