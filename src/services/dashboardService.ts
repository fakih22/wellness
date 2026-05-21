import { api } from './api';
import type { ApiResponse, DashboardSummary } from '../types';

export const dashboardService = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    return api.get<ApiResponse<DashboardSummary>>('/api/dashboard/summary');
  },
};
