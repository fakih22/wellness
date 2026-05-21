import { api } from './api';
import type { ApiResponse, WaterLog } from '../types';

export const waterService = {
  async getWaterLogs(days = 7): Promise<ApiResponse<WaterLog[]>> {
    return api.get<ApiResponse<WaterLog[]>>(`/api/water?days=${days}`);
  },

  async getTodayWater(): Promise<ApiResponse<WaterLog>> {
    return api.get<ApiResponse<WaterLog>>('/api/water/today');
  },

  async updateWaterIntake(amount: number): Promise<ApiResponse<WaterLog>> {
    return api.post<ApiResponse<WaterLog>>('/api/water', { amount });
  },

  async incrementWater(increment: number): Promise<ApiResponse<WaterLog>> {
    return api.patch<ApiResponse<WaterLog>>('/api/water/today', { increment });
  },
};
