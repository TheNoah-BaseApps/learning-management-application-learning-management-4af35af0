'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProgramTable() {
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/programs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPrograms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Program Name' },
    { key: 'description', label: 'Description', render: (value) => value?.substring(0, 50) + (value?.length > 50 ? '...' : '') },
    { key: 'duration', label: 'Duration (weeks)' },
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
        <Button variant="ghost" size="sm" onClick={() => router.push(`/programs/${row.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return <DataTable columns={columns} data={programs} loading={loading} />;
}