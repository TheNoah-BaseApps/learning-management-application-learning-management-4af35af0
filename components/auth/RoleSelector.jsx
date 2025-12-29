'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';

export default function RoleSelector({ value, onChange }) {
  const roles = [
    { value: 'employee', label: 'Employee', description: 'Access to own courses and progress' },
    { value: 'manager', label: 'Manager', description: 'Manage department learning activities' },
    { value: 'admin', label: 'Administrator', description: 'Full system access and control' }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="role" className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Role
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              <div className="flex flex-col">
                <span className="font-medium">{role.label}</span>
                <span className="text-xs text-gray-500">{role.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}