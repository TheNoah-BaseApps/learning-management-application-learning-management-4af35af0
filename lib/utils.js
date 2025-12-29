import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '';
  }
}

export function formatDateTime(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '';
  }
}

export function formatPercentage(value) {
  if (value === null || value === undefined) return '0%';
  const num = parseFloat(value);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(1)}%`;
}

export function formatDuration(hours) {
  if (!hours) return '0h';
  const h = parseInt(hours);
  if (h < 1) return `${(h * 60).toFixed(0)}m`;
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const remainingHours = h % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  return `${h}h`;
}

export function getStatusColor(status) {
  const statusColors = {
    // Enrollment statuses
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Active': 'bg-green-100 text-green-800 border-green-300',
    'Completed': 'bg-blue-100 text-blue-800 border-blue-300',
    'Cancelled': 'bg-gray-100 text-gray-800 border-gray-300',
    'Expired': 'bg-red-100 text-red-800 border-red-300',
    
    // Registration statuses
    'Approved': 'bg-green-100 text-green-800 border-green-300',
    'Rejected': 'bg-red-100 text-red-800 border-red-300',
    
    // Generic statuses
    'Draft': 'bg-gray-100 text-gray-800 border-gray-300',
    'Published': 'bg-green-100 text-green-800 border-green-300',
    'Archived': 'bg-gray-100 text-gray-800 border-gray-300',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getProgressColor(percentage) {
  const pct = parseFloat(percentage) || 0;
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-blue-500';
  if (pct >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function calculateDaysRemaining(endDate) {
  if (!endDate) return null;
  try {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return null;
  }
}

export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function downloadFile(data, filename, type = 'text/csv') {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
}