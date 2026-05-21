import { api } from './api';
import type { ApiResponse, Mood, MoodType } from '../types';

export const moodService = {
  async getMoods(period: 'day' | 'week' | 'month' | 'all' = 'week', limit = 30): Promise<ApiResponse<Mood[]>> {
    return api.get<ApiResponse<Mood[]>>(`/api/moods?period=${period}&limit=${limit}`);
  },

  async getTodayMood(): Promise<ApiResponse<Mood | null>> {
    return api.get<ApiResponse<Mood | null>>('/api/moods/today');
  },

  async createMood(mood: MoodType, note?: string): Promise<ApiResponse<Mood>> {
    return api.post<ApiResponse<Mood>>('/api/moods', { mood, note });
  },

  async updateMood(id: string, mood?: MoodType, note?: string): Promise<ApiResponse<Mood>> {
    return api.put<ApiResponse<Mood>>(`/api/moods/${id}`, { mood, note });
  },

  async deleteMood(id: string): Promise<ApiResponse<null>> {
    return api.delete<ApiResponse<null>>(`/api/moods/${id}`);
  },
};
