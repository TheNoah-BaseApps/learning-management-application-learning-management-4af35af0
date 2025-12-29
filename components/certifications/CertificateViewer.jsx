'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Share2, CheckCircle, Award, Calendar, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function CertificateViewer({ certificationId, certification }) {
  const [cert, setCert] = useState(certification);
  const [loading, setLoading] = useState(!certification);
  const [error, setError] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    if (certificationId && !certification) {
      fetchCertification();
    }
  }, [certificationId, certification]);

  const fetchCertification = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/certifications/${certificationId}`);
      if (!response.ok) throw new Error('Failed to fetch certification');
      
      const data = await response.json();
      setCert(data.data);
    } catch (err) {
      console.error('Error fetching certification:', err);
      setError(err.message || 'Failed to load certification');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/certifications/${cert.id}/download`);
      if (!response.ok) throw new Error('Failed to download certificate');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${cert.certificate_id || cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/certifications/${cert.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: cert.certificate_name || 'Certificate',
          text: `Check out my certificate for ${cert.course_title}`,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cert) {
    return (
      <Alert>
        <AlertDescription>Certificate not found</AlertDescription>
      </Alert>
    );
  }

  const isExpired = cert.expires_at && new Date(cert.expires_at) < new Date();
  const isValid = cert.status !== 'revoked' && !isExpired;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Valid Certificate</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <Award className="h-5 w-5" />
              <span className="font-medium">
                {cert.status === 'revoked' ? 'Revoked' : 'Expired'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Certificate Display */}
      <Card 
        ref={certificateRef}
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '600px'
        }}
      >
        <CardContent className="p-12">
          <div className="bg-white rounded-lg shadow-2xl p-12 space-y-8">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <Award className="h-20 w-20 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Certificate of Completion
              </h1>
              <p className="text-lg text-gray-600">
                This is to certify that
              </p>
            </div>

            {/* Recipient Name */}
            <div className="text-center py-6">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                {cert.employee_name || 'Recipient Name'}
              </h2>
              <p className="text-xl text-gray-600">
                has successfully completed
              </p>
            </div>

            {/* Course Details */}
            <div className="text-center py-6 border-y">
              <h3 className="text-3xl font-semibold text-primary mb-4">
                {cert.course_title || cert.certificate_name}
              </h3>
              {cert.course_description && (
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {cert.course_description}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500 uppercase">Issued</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {cert.issued_date 
                    ? format(new Date(cert.issued_date), 'MMMM dd, yyyy')
                    : 'N/A'}
                </div>
              </div>

              {cert.expires_at && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 uppercase">Expires</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {format(new Date(cert.expires_at), 'MMMM dd, yyyy')}
                  </div>
                </div>
              )}

              {cert.score !== undefined && cert.score !== null && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 uppercase">Score</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {cert.score}%
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500 uppercase">ID</span>
                </div>
                <div className="font-mono text-sm font-semibold text-gray-900">
                  {cert.certificate_id || cert.id?.substring(0, 12)}
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t">
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-2 mb-2">
                  <p className="font-semibold">{cert.instructor_name || 'Instructor Name'}</p>
                </div>
                <p className="text-sm text-gray-500">Course Instructor</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-300 pt-2 mb-2">
                  <p className="font-semibold">{cert.issuer_name || 'Administrator'}</p>
                </div>
                <p className="text-sm text-gray-500">Training Administrator</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-500">
                This certificate can be verified at {window.location.origin}/verify/{cert.certificate_id || cert.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Certificate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Employee
              </div>
              <div className="font-medium">{cert.employee_name || 'N/A'}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                Course
              </div>
              <div className="font-medium">{cert.course_title || 'N/A'}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Issue Date
              </div>
              <div className="font-medium">
                {cert.issued_date 
                  ? format(new Date(cert.issued_date), 'MMMM dd, yyyy')
                  : 'N/A'}
              </div>
            </div>
            {cert.expires_at && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Expiration Date
                </div>
                <div className="font-medium">
                  {format(new Date(cert.expires_at), 'MMMM dd, yyyy')}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Award className="h-4 w-4" />
                Certificate ID
              </div>
              <div className="font-mono text-sm font-medium">
                {cert.certificate_id || cert.id}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CheckCircle className="h-4 w-4" />
                Status
              </div>
              <div className="font-medium">
                {isValid ? 'Valid' : cert.status === 'revoked' ? 'Revoked' : 'Expired'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}