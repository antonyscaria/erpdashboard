// app/dashboard/page.tsx (Keep this as a Server Component)
import React from 'react';
import DashboardClientLayout from './_components/DashboardClientLayout';
import { 
  getDashboardMetrics, 
  getMaterialRequests, 
  getCostAnalysisTree, 
  getProjectContext 
} from './actions';

export const dynamic = 'force-dynamic';

export default async function DashboardRootPage({ searchParams }: { searchParams: any }) {
  const resolvedParams = await searchParams;
  const targetProjectId = '1';

  // 1. Fetch ALL data on the server
  const [metrics, materialRequests, costTree, context] = await Promise.all([
    getDashboardMetrics(targetProjectId),
    getMaterialRequests(targetProjectId, resolvedParams),
    getCostAnalysisTree(targetProjectId, resolvedParams.tab || 'Materials'),
    getProjectContext(targetProjectId)
  ]);

  // 2. Pass the data as props
  return (
    <DashboardClientLayout 
      initialMetrics={metrics}
      initialMRs={materialRequests}  
      initialTree={costTree}
      initialContext={context}
    />
  );
}