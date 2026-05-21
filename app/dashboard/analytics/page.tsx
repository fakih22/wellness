'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Droplets, Moon, Footprints, Smile } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface AnalyticsData {
  water: { date: string; amount: number }[];
  sleep: { date: string; hours: number }[];
  exercise: { date: string; calories: number }[];
  mood: { mood: string; count: number }[];
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [waterAnalytics, setWaterAnalytics] = useState<any>(null);
  const [sleepAnalytics, setSleepAnalytics] = useState<any>(null);
  const [exerciseAnalytics, setExerciseAnalytics] = useState<any>(null);
  const [moodAnalytics, setMoodAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const getDaysForPeriod = (period: string) => {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
      default: return 7;
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const days = getDaysForPeriod(period);
      
      // Fetch all analytics data
      const [waterRes, sleepRes, exerciseRes, moodRes] = await Promise.all([
        fetch(`/api/analytics/water?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/analytics/sleep?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/analytics/exercise?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/analytics/mood?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const [water, sleep, exercise, mood] = await Promise.all([
        waterRes.json(),
        sleepRes.json(),
        exerciseRes.json(),
        moodRes.json(),
      ]);

      if (water.success) setWaterAnalytics(water.data);
      if (sleep.success) setSleepAnalytics(sleep.data);
      if (exercise.success) setExerciseAnalytics(exercise.data);
      if (mood.success) setMoodAnalytics(mood.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgWater = waterAnalytics?.average || 0;
  const avgSleep = sleepAnalytics?.average || 0;
  const totalCalories = exerciseAnalytics?.totalCalories || 0;
  const totalExercises = exerciseAnalytics?.totalWorkouts || 0;

  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    calm: '😌',
    neutral: '😐',
    tired: '😴',
    stress: '😰',
    sad: '😢',
  };

  return (
    <DashboardLayout title="Analytics">
      <div className="max-w-6xl mx-auto">
        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analitikmu</h2>
            <p className="text-gray-600 text-sm">Pantau progres wellnessmu dari waktu ke waktu</p>
          </div>
          <div className="flex gap-2">
            {[{ key: 'week', label: 'Minggu' }, { key: 'month', label: 'Bulan' }, { key: 'year', label: 'Tahun' }].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                suppressHydrationWarning
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  period === p.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Empty State - Show if all data is empty */}
            {(!waterAnalytics || waterAnalytics.count === 0) &&
             (!sleepAnalytics || sleepAnalytics.count === 0) &&
             (!exerciseAnalytics || exerciseAnalytics.totalWorkouts === 0) &&
             (!moodAnalytics || moodAnalytics.total === 0) ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Data</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Mulai catat perjalanan wellnessmu dengan menambahkan entri pertamamu. 
                  Analitikmu akan muncul di sini setelah kamu memiliki data.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                  <Link
                    href="/dashboard/water"
                    className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
                  >
                    <Droplets className="w-5 h-5" />
                    Tambah Log Air
                  </Link>
                  <Link
                    href="/dashboard/sleep"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Moon className="w-5 h-5" />
                    Tambah Log Tidur
                  </Link>
                  <Link
                    href="/dashboard/exercise"
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Footprints className="w-5 h-5" />
                    Tambah Olahraga
                  </Link>
                  <Link
                    href="/dashboard/mood"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Smile className="w-5 h-5" />
                    Tambah Suasana Hati
                  </Link>
                </div>
              </div>
            ) : (
              <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Water */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-cyan-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Rata-rata Air</h3>
                <p className="text-3xl font-bold text-gray-900">{avgWater.toFixed(1)}L</p>
                <p className="text-xs text-gray-500 mt-1">per hari</p>
              </div>

              {/* Sleep */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Rata-rata Tidur</h3>
                <p className="text-3xl font-bold text-gray-900">{avgSleep.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">per malam</p>
              </div>

              {/* Exercise */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Footprints className="w-6 h-6 text-orange-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Kalori</h3>
                <p className="text-3xl font-bold text-gray-900">{totalCalories}</p>
                <p className="text-xs text-gray-500 mt-1">{totalExercises} sesi olahraga</p>
              </div>

              {/* Mood */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Smile className="w-6 h-6 text-purple-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Catatan Suasana Hati</h3>
                <p className="text-3xl font-bold text-gray-900">{moodAnalytics?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">entri</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Water Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                  Tren Asupan Air
                </h3>
                {!waterAnalytics || waterAnalytics.count === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada data air</p>
                ) : (
                  <div className="space-y-3">
                    {waterAnalytics.labels.slice(0, 7).map((label: string, index: number) => {
                      const amount = waterAnalytics.data[index];
                      const percentage = (amount / 3) * 100; // Max 3L
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium text-gray-900">{amount.toFixed(1)}L</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sleep Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-600" />
                  Tren Durasi Tidur
                </h3>
                {!sleepAnalytics || sleepAnalytics.count === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada data tidur</p>
                ) : (
                  <div className="space-y-3">
                    {sleepAnalytics.labels.slice(0, 7).map((label: string, index: number) => {
                      const hours = sleepAnalytics.data[index];
                      const percentage = (hours / 10) * 100; // Max 10h
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium text-gray-900">{hours.toFixed(1)}h</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Exercise Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-orange-600" />
                  Aktivitas Olahraga
                </h3>
                {!exerciseAnalytics || exerciseAnalytics.totalWorkouts === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada data olahraga</p>
                ) : (
                  <div className="space-y-3">
                    {exerciseAnalytics.byType.slice(0, 7).map((item: any, index: number) => {
                      const percentage = (item.calories / 500) * 100; // Max 500 cal per session
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              {item.type} ({item.count}x)
                            </span>
                            <span className="font-medium text-gray-900">{item.calories} kcal</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mood Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-purple-600" />
                  Distribusi Suasana Hati
                </h3>
                {!moodAnalytics || moodAnalytics.total === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada data suasana hati</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(moodAnalytics.breakdown).map(([mood, count]: [string, any]) => {
                      const percentage = (count / moodAnalytics.total) * 100;
                      return (
                        <div key={mood}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 flex items-center gap-2">
                              <span className="text-2xl">{moodEmojis[mood]}</span>
                              {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </span>
                            <span className="font-medium text-gray-900">{count} kali</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
