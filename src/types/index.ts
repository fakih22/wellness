// User types
export interface User {
  id?: string;
  uid: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  avatarInitial?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Mood types
export type MoodType = 'happy' | 'calm' | 'neutral' | 'tired' | 'stress' | 'sad';

export interface Mood {
  id: string;
  userId: string;
  mood: MoodType;
  note?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Water Log types
export interface WaterLog {
  id: string;
  userId: string;
  amount: number;
  date: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Sleep Log types
export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface SleepLog {
  id: string;
  userId: string;
  sleepTime: string | Date;
  wakeUpTime: string | Date;
  totalHours: number;
  quality: SleepQuality;
  note?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Exercise types
export type ExerciseType = 'walking' | 'running' | 'gym' | 'yoga' | 'cycling' | 'other';
export type ExerciseIntensity = 'low' | 'medium' | 'high';

export interface ExerciseLog {
  id: string;
  userId: string;
  type: ExerciseType;
  duration: number;
  calories: number;
  intensity: ExerciseIntensity;
  note?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Habit types
export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  frequency: 'daily' | 'weekly';
  targetDays?: number;
  completedDates: (string | Date)[];
  streak: number;
  bestStreak: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Goal types
export type GoalCategory = 'water' | 'sleep' | 'exercise' | 'habit' | 'weight' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string | Date;
  status: GoalStatus;
  progress: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Journal types
export interface Journal {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: MoodType;
  tags?: string[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Achievement types
export type AchievementCategory = 'streak' | 'water' | 'sleep' | 'exercise' | 'habit' | 'general';

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Dashboard Summary types
export interface DashboardSummary {
  todayMood?: Mood;
  todayWater: WaterLog | null;
  latestSleep?: SleepLog;
  todayExercises: ExerciseLog[];
  activeHabits: Habit[];
  activeGoals: Goal[];
  totalStreak: number;
  recentAchievements: Achievement[];
  wellnessScore: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Analytics types
export interface MoodAnalytics {
  labels: string[];
  data: number[];
  mostFrequent: MoodType;
}

export interface WaterAnalytics {
  labels: string[];
  data: number[];
  average: number;
  total: number;
}

export interface SleepAnalytics {
  labels: string[];
  data: number[];
  average: number;
}

export interface ExerciseAnalytics {
  totalDuration: number;
  totalCalories: number;
  byType: { type: string; count: number; duration: number }[];
}
