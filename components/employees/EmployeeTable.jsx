'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmployeeTable() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'employee_name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'email_address', label: 'Email' },
    {
      key: 'registration_status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/employees/${row.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return <DataTable columns={columns} data={employees} loading={loading} />;
}