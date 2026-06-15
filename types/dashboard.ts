export interface DashboardMetrics {
  revenue: string;
  projectValue: string;
  scrapRevenue: string;
  totalExpenses: string;
  actualCost: string;
  committedCost: string;
  runningPnL: string;
  profitMargin: string;
}

export interface MaterialRequest {
  id: number;
  mr_number: string;
  date: string;
  requestor_name: string;
  supplier_name: string;
  purpose: string;
  stage: 'Draft' | 'QS Price Check' | 'Approved' | 'Ordered' | 'Completed';
  status: 'Paid' | 'Unpaid';
  subtotal: string;
  vat: string;
  value: string;
  tags: string[];
}

export interface CostCategory {
  id: number;
  parent_id: number | null;
  name: string;
  direct_spend: number;
  total_spend: number;
}

export interface DashboardPayload {
  metrics: DashboardMetrics;
  materialRequests: MaterialRequest[];
  costAnalysis: CostCategory[];
}