'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Mail, Phone, Building, Briefcase, Calendar } from 'lucide-react';

export default function EmployeeProfile({ employee }) {
  if (!employee) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Information</CardTitle>
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(employee.registration_status)}`}>
              {employee.registration_status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Employee ID</label>
              <p className="mt-1 font-mono text-sm">{employee.employee_id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{employee.email_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Contact</label>
                <p className="mt-1">{employee.contact_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Department</label>
                <p className="mt-1">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Designation</label>
                <p className="mt-1">{employee.designation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Joining</label>
                <p className="mt-1">{formatDate(employee.date_of_joining)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}