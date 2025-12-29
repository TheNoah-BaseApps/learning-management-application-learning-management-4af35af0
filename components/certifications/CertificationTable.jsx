'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Calendar, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  active: { 
    label: 'Active', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  expiring_soon: { 
    label: 'Expiring Soon', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle
  },
  expired: { 
    label: 'Expired', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  },
  revoked: { 
    label: 'Revoked', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle
  }
};

export default function CertificationTable({ certifications = [], onView, onDownload, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issued_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const getStatus = (cert) => {
    if (cert.status === 'revoked') return 'revoked';
    if (!cert.expires_at) return 'active';
    
    const expiryDate = new Date(cert.expires_at);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
  };

  const filteredCertifications = certifications
    .map(cert => ({
      ...cert,
      computedStatus: getStatus(cert)
    }))
    .filter(cert => {
      const matchesSearch = !searchTerm || 
        cert.certificate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cert.computedStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'issued_date' || sortBy === 'expires_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getDaysUntilExpiry = (expiresAt) => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const days = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 animate-pulse rounded" />
        <div className="h-64 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('certificate_name')}
              >
                Certificate {sortBy === 'certificate_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('issued_date')}
              >
                Issued Date {sortBy === 'issued_date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('expires_at')}
              >
                Expiry Date {sortBy === 'expires_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Certificate ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No certifications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCertifications.map((cert) => {
                const statusConfig = STATUS_CONFIG[cert.computedStatus];
                const StatusIcon = statusConfig.icon;
                const daysUntilExpiry = getDaysUntilExpiry(cert.expires_at);

                return (
                  <TableRow key={cert.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        {cert.certificate_name || 'Certificate'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {cert.employee_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {cert.course_title || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {cert.issued_date 
                          ? format(new Date(cert.issued_date), 'MMM dd, yyyy')
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.expires_at ? (
                        <div className="text-sm">
                          <div>{format(new Date(cert.expires_at), 'MMM dd, yyyy')}</div>
                          {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                            <div className={`text-xs ${daysUntilExpiry <= 30 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                              {daysUntilExpiry} days left
                            </div>
                          )}
                          {daysUntilExpiry !== null && daysUntilExpiry < 0 && (
                            <div className="text-xs text-red-600">
                              Expired {Math.abs(daysUntilExpiry)} days ago
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No expiry</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-mono text-muted-foreground">
                        {cert.certificate_id || cert.id?.substring(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(cert)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onDownload && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDownload(cert)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredCertifications.length} of {certifications.length} certifications
        </div>
        <div className="flex gap-4">
          <span className="text-green-600">
            {certifications.filter(c => getStatus(c) === 'active').length} Active
          </span>
          <span className="text-yellow-600">
            {certifications.filter(c => getStatus(c) === 'expiring_soon').length} Expiring Soon
          </span>
          <span className="text-red-600">
            {certifications.filter(c => getStatus(c) === 'expired').length} Expired
          </span>
        </div>
      </div>
    </div>
  );
}