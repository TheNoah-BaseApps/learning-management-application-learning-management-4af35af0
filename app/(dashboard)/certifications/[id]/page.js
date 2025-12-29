'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import CertificateViewer from '@/components/certifications/CertificateViewer';

export default function CertificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [certification, setCertification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertification();
  }, [params.id]);

  async function fetchCertification() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/certifications/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch certification');
      }

      const data = await res.json();
      setCertification(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching certification:', err);
      setError('Failed to load certification');
      toast.error('Failed to load certification');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    toast.success('Certificate download started');
    // Implement PDF download logic
  }

  function handleShare() {
    toast.success('Share link copied to clipboard');
    // Implement share logic
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !certification) {
    return <ErrorMessage message={error || 'Certification not found'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Certificate</h1>
            <p className="text-gray-600 mt-1">{certification.certificate_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <CertificateViewer certification={certification} />
    </div>
  );
}