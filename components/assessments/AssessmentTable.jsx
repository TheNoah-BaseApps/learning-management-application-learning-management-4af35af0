'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ASSESSMENT_TYPES = {
  quiz: { label: 'Quiz', color: 'bg-blue-100 text-blue-800' },
  exam: { label: 'Exam', color: 'bg-purple-100 text-purple-800' },
  assignment: { label: 'Assignment', color: 'bg-green-100 text-green-800' },
  practical: { label: 'Practical', color: 'bg-orange-100 text-orange-800' }
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: XCircle }
};

export default function AssessmentTable({ assessments = [], onView, onEdit, onDelete, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredAssessments = assessments
    .filter(assessment => {
      const matchesSearch = !searchTerm || 
        assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || assessment.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Assessment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ASSESSMENT_TYPES).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
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
                onClick={() => handleSort('title')}
              >
                Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('duration')}
              >
                Duration {sortBy === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Pass Score</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('created_at')}
              >
                Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssessments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No assessments found. Create your first assessment to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssessments.map((assessment) => {
                const typeConfig = ASSESSMENT_TYPES[assessment.type] || ASSESSMENT_TYPES.quiz;
                const statusConfig = STATUS_CONFIG[assessment.status] || STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={assessment.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {assessment.title || 'Untitled Assessment'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {assessment.course_title || 'No course assigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assessment.duration ? `${assessment.duration} min` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {assessment.total_questions || assessment.questions?.length || 0}
                    </TableCell>
                    <TableCell>
                      {assessment.passing_score || 70}%
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {assessment.created_at 
                          ? format(new Date(assessment.created_at), 'MMM dd, yyyy')
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(assessment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(assessment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(assessment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
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
      <div className="text-sm text-muted-foreground">
        Showing {filteredAssessments.length} of {assessments.length} assessments
      </div>
    </div>
  );
}