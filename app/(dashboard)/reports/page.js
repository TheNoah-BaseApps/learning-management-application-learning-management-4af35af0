'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewDashboard from '@/components/reports/OverviewDashboard';
import EmployeeReport from '@/components/reports/EmployeeReport';
import CourseAnalytics from '@/components/reports/CourseAnalytics';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Insights into learning outcomes and performance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Reports</TabsTrigger>
          <TabsTrigger value="courses">Course Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewDashboard />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <EmployeeReport />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <CourseAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}