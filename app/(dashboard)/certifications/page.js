'use client';

import CertificationTable from '@/components/certifications/CertificationTable';

export default function CertificationsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-gray-600 mt-1">View and manage issued certificates</p>
        </div>
      </div>

      <CertificationTable />
    </>
  );
}