import { api } from './api';
import type { ApiResponse, Habit } from '../types';

export const habitService = {
  async getHabits(active?: boolean): Promise<ApiResponse<Habit[]>> {
    const query = active !== undefined ? `?active=${active}` : '';
    return api.get<ApiResponse<Habit[]>>(`/api/habits${query}`);
  },

  async createHabit(data: {
    name: string;
    icon?: string;
    color?: string;
    frequency?: 'daily' | 'weekly';
    targetDays?: number;
  }): Promise<ApiResponse<Habit>> {
    return api.post<ApiResponse<Habit>>('/api/habits', data);
  },

  async updateHabit(id: string, data: Partial<Habit>): Promise<ApiResponse<Habit>> {
    return api.put<ApiResponse<Habit>>(`/api/habits/${id}`, data);
  },

  async deleteHabit(id: string): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/api/habits/${id}`);
  },

  async toggleHabit(id: string, date?: Date): Promise<ApiResponse<Habit>> {
    return api.post<ApiResponse<Habit>>(`/api/habits/${id}/toggle`, { date });
  },
};
