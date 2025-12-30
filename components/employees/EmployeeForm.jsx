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
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const newErrors = {};

    // Employee ID validation
    if (!formData.employee_id || formData.employee_id.trim() === '') {
      newErrors.employee_id = 'Employee ID is required';
    }

    // Employee name validation
    if (!formData.employee_name || formData.employee_name.trim() === '') {
      newErrors.employee_name = 'Employee name is required';
    } else if (formData.employee_name.length < 2) {
      newErrors.employee_name = 'Employee name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email_address || formData.email_address.trim() === '') {
      newErrors.email_address = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = 'Please enter a valid email address';
    }

    // Contact number validation (optional but validate format if provided)
    if (formData.contact_number && !/^[\d\s\-\+\(\)]+$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid contact number';
    }

    // Department validation
    if (!formData.department || formData.department.trim() === '') {
      newErrors.department = 'Department is required';
    }

    // Designation validation
    if (!formData.designation || formData.designation.trim() === '') {
      newErrors.designation = 'Designation is required';
    }

    // Date of joining validation
    if (!formData.date_of_joining) {
      newErrors.date_of_joining = 'Date of joining is required';
    } else {
      const joiningDate = new Date(formData.date_of_joining);
      const today = new Date();
      if (joiningDate > today) {
        newErrors.date_of_joining = 'Date of joining cannot be in the future';
      }
    }

    // Employment type validation
    if (!formData.employment_type) {
      newErrors.employment_type = 'Employment type is required';
    }

    // Registration status validation
    if (!formData.registration_status) {
      newErrors.registration_status = 'Registration status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      console.error('Form validation failed:', errors);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const url = employee ? `/api/employees/${employee.id}` : '/api/employees';
      const method = employee ? 'PUT' : 'POST';

      console.log(`Submitting employee data (${method}):`, formData);

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
        // Handle specific error responses
        if (res.status === 400) {
          console.error('Validation error from server:', data);
          
          // If server returns field-specific errors
          if (data.errors) {
            setErrors(data.errors);
            toast.error('Please check the form for errors');
          } else {
            toast.error(data.error || data.message || 'Invalid data provided');
          }
        } else if (res.status === 401) {
          console.error('Authentication error:', data);
          toast.error('Session expired. Please log in again.');
        } else if (res.status === 403) {
          console.error('Authorization error:', data);
          toast.error('You do not have permission to perform this action');
        } else if (res.status === 404) {
          console.error('Resource not found:', data);
          toast.error('Employee record not found');
        } else if (res.status === 409) {
          console.error('Conflict error:', data);
          toast.error(data.error || 'Employee ID already exists');
        } else if (res.status >= 500) {
          console.error('Server error:', data);
          toast.error('Server error occurred. Please try again later.');
        } else {
          console.error('Unknown error:', data);
          toast.error(data.error || data.message || 'An unexpected error occurred');
        }
        
        throw new Error(data.error || data.message || 'Failed to save employee');
      }

      console.log('Employee saved successfully:', data);
      toast.success(employee ? 'Employee updated successfully' : 'Employee created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      
      // Only show toast if we haven't already shown one
      if (error.message && !error.message.includes('Failed to save employee')) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input
            id="employee_id"
            value={formData.employee_id}
            onChange={(e) => handleInputChange('employee_id', e.target.value)}
            required
            disabled={!!employee}
            className={errors.employee_id ? 'border-red-500' : ''}
          />
          {errors.employee_id && (
            <p className="text-sm text-red-500">{errors.employee_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_name">Full Name</Label>
          <Input
            id="employee_name"
            value={formData.employee_name}
            onChange={(e) => handleInputChange('employee_name', e.target.value)}
            required
            className={errors.employee_name ? 'border-red-500' : ''}
          />
          {errors.employee_name && (
            <p className="text-sm text-red-500">{errors.employee_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_address">Email</Label>
          <Input
            id="email_address"
            type="email"
            value={formData.email_address}
            onChange={(e) => handleInputChange('email_address', e.target.value)}
            required
            className={errors.email_address ? 'border-red-500' : ''}
          />
          {errors.email_address && (
            <p className="text-sm text-red-500">{errors.email_address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input
            id="contact_number"
            value={formData.contact_number}
            onChange={(e) => handleInputChange('contact_number', e.target.value)}
            className={errors.contact_number ? 'border-red-500' : ''}
          />
          {errors.contact_number && (
            <p className="text-sm text-red-500">{errors.contact_number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            required
            className={errors.department ? 'border-red-500' : ''}
          />
          {errors.department && (
            <p className="text-sm text-red-500">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={formData.designation}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            required
            className={errors.designation ? 'border-red-500' : ''}
          />
          {errors.designation && (
            <p className="text-sm text-red-500">{errors.designation}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_joining">Date of Joining</Label>
          <Input
            id="date_of_joining"
            type="date"
            value={formData.date_of_joining}
            onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
            required
            className={errors.date_of_joining ? 'border-red-500' : ''}
          />
          {errors.date_of_joining && (
            <p className="text-sm text-red-500">{errors.date_of_joining}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employment_type">Employment Type</Label>
          <Select 
            value={formData.employment_type} 
            onValueChange={(value) => handleInputChange('employment_type', value)}
          >
            <SelectTrigger className={errors.employment_type ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-Time">Full-Time</SelectItem>
              <SelectItem value="Part-Time">Part-Time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Intern">Intern</SelectItem>
            </SelectContent>
          </Select>
          {errors.employment_type && (
            <p className="text-sm text-red-500">{errors.employment_type}</p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="registration_status">Registration Status</Label>
          <Select 
            value={formData.registration_status} 
            onValueChange={(value) => handleInputChange('registration_status', value)}
          >
            <SelectTrigger className={errors.registration_status ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {errors.registration_status && (
            <p className="text-sm text-red-500">{errors.registration_status}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {employee ? 'Update Employee' : 'Create Employee'}
      </Button>
    </form>
  );
}