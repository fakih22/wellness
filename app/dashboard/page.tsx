'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, Droplets, Moon, Footprints, Target, 
  TrendingUp, Calendar, Award, LogOut, User, Settings, Home, Check
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { useDashboard } from '@/src/hooks/useDashboard';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { summary, loading, refetch } = useDashboard();
  const [toggling, setToggling] = useState<string | null>(null);

  // All hooks must be called before any conditional returns
  const wellnessScore = summary?.wellnessScore || 0;
  const todayWater = summary?.todayWater?.amount || 0;
  const latestSleep = summary?.latestSleep?.totalHours || 0;
  const todayExercises = summary?.todayExercises || [];
  const totalCalories = todayExercises.reduce((sum, ex) => sum + ex.calories, 0);
  const activeHabits = summary?.activeHabits || [];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Debug: Log active habits
  useEffect(() => {
    console.log('Active Habits:', activeHabits);
    console.log('Summary:', summary);
  }, [activeHabits, summary]);

  // Define functions before conditional return
  const toggleHabit = async (habitId: string) => {
    console.log('Toggling habit:', habitId);
    try {
      setToggling(habitId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });
      
      if (response.ok) {
        // Refresh dashboard data
        await refetch();
      } else {
        console.error('Failed to toggle habit');
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    } finally {
      setToggling(null);
    }
  };

  const isCompletedToday = (habit: any) => {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    return habit.completedDates.some((dateItem: any) => {
      let date;
      
      if (typeof dateItem === 'string') {
        date = new Date(dateItem);
      } else if (dateItem && typeof dateItem === 'object') {
        if (dateItem._seconds) {
          date = new Date(dateItem._seconds * 1000);
        } else if (dateItem.seconds) {
          date = new Date(dateItem.seconds * 1000);
        } else if (dateItem.toDate) {
          date = dateItem.toDate();
        } else {
          date = new Date(dateItem);
        }
      } else {
        return false;
      }
      
      date.setHours(0, 0, 0, 0);
      return date.getTime() === todayTime;
    });
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboardmu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vitality</h1>
                <p className="text-xs text-gray-500">Dashboard Wellness</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  Kembali ke Beranda
                </span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat datang kembali, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">Ini ringkasan wellnessmu hari ini</p>
        </div>

        {/* Wellness Score */}
        <div className="mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Skor Wellnessmu</p>
              <p className="text-5xl font-bold">{wellnessScore}<span className="text-2xl text-blue-200">/100</span></p>
              <p className="text-blue-100 mt-2">
                {wellnessScore >= 80 ? '🎉 Luar biasa!' : wellnessScore >= 60 ? '👍 Kerja bagus!' : '💪 Terus semangat!'}
              </p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="white" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56 * (wellnessScore / 100)} ${2 * Math.PI * 56}`}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Water */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <Link href="/dashboard/water" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat →
              </Link>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Asupan Air</h3>
            <p className="text-2xl font-bold text-gray-900">{todayWater.toFixed(1)}L</p>
            <p className="text-xs text-gray-500 mt-1">Target: 2.5L</p>
          </div>

          {/* Sleep */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-600" />
              </div>
              <Link href="/dashboard/sleep" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat →
              </Link>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tidur Terakhir</h3>
            <p className="text-2xl font-bold text-gray-900">{latestSleep.toFixed(1)}h</p>
            <p className="text-xs text-gray-500 mt-1">
              {latestSleep >= 7 ? 'Tidur nyenyak!' : 'Butuh lebih banyak istirahat'}
            </p>
          </div>

          {/* Exercise */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Footprints className="w-6 h-6 text-orange-600" />
              </div>
              <Link href="/dashboard/exercise" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat →
              </Link>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Kalori Terbakar</h3>
            <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
            <p className="text-xs text-gray-500 mt-1">{todayExercises.length} olahraga hari ini</p>
          </div>

          {/* Habits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <Link href="/dashboard/habits" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat →
              </Link>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Kebiasaan Aktif</h3>
            <p className="text-2xl font-bold text-gray-900">{summary?.activeHabits?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Streak: {summary?.totalStreak || 0} hari</p>
          </div>
        </div>

        {/* Daily Habits Section */}
        {activeHabits.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Kebiasaan Harian</h3>
              <p className="text-gray-500">
                {activeHabits.filter(h => isCompletedToday(h)).length}/{activeHabits.length} selesai hari ini
              </p>
            </div>
            
            <div className="space-y-3">
              {activeHabits.map((habit: any) => {
                const completed = isCompletedToday(habit);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    disabled={toggling === habit.id}
                    className={`w-full p-4 rounded-xl transition-all duration-300 text-left flex items-center gap-4 ${
                      completed
                        ? 'bg-green-50 border-2 border-green-200'
                        : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                    } ${toggling === habit.id ? 'opacity-70 cursor-wait' : 'cursor-pointer'} disabled:cursor-not-allowed`}
                  >
                    {/* Checkmark Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      completed ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                    }`}>
                      {completed && <Check className="w-5 h-5 text-white" />}
                    </div>
                    
                    {/* Habit Icon */}
                    <div className="text-2xl flex-shrink-0">
                      {habit.icon}
                    </div>
                    
                    {/* Habit Name */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-lg font-medium ${
                        completed ? 'text-gray-600 line-through' : 'text-gray-900'
                      }`}>
                        {habit.name}
                      </h4>
                    </div>
                    
                    {/* Loading Spinner */}
                    {toggling === habit.id && (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <Link
              href="/dashboard/habits"
              className="mt-6 block w-full py-3 bg-purple-600 text-white text-center rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Lihat Semua Kebiasaan
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/mood"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-105 text-center"
          >
            <div className="text-3xl mb-2">😊</div>
            <p className="text-sm font-medium text-gray-900">Catat Suasana Hati</p>
          </Link>
          <Link
            href="/dashboard/journal"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-105 text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <p className="text-sm font-medium text-gray-900">Jurnal</p>
          </Link>
          <Link
            href="/dashboard/goals"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-105 text-center"
          >
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm font-medium text-gray-900">Goals</p>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-105 text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-medium text-gray-900">Analitik</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
