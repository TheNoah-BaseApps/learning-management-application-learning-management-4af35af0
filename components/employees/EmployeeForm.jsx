'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EmployeeForm({ employee, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: employee?.employee_id || '',
    employee_name: employee?.employee_name || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    date_of_joining: employee?.date_of_joining || '',
    contact_number: employee?.contact_number || '',
    email_address: employee?.email_address || '',
    employment_type: employee?.employment_type || 'Full-Time',
    registration_status: employee?.registration_status || 'Pending'
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees';
      const method = employee ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save employee');
      }

      toast.success(employee ? 'Employee updated successfully' : 'Employee created successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input
            id="employee_id"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            required
            disabled={!!employee}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_name">Full Name</Label>
          <Input
            id="employee_name"
            value={formData.employee_name}
            onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_address">Email</Label>
          <Input
            id="email_address"
            type="email"
            value={formData.email_address}
            onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input
            id="contact_number"
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_joining">Date of Joining</Label>
          <Input
            id="date_of_joining"
            type="date"
            value={formData.date_of_joining}
            onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employment_type">Employment Type</Label>
          <Select value={formData.employment_type} onValueChange={(value) => setFormData({ ...formData, employment_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-Time">Full-Time</SelectItem>
              <SelectItem value="Part-Time">Part-Time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Intern">Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="registration_status">Registration Status</Label>
          <Select value={formData.registration_status} onValueChange={(value) => setFormData({ ...formData, registration_status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {employee ? 'Update Employee' : 'Create Employee'}
      </Button>
    </form>
  );
}