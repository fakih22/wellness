'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Smile, Frown, Meh, BatteryMedium, BatteryLow, 
  Moon, Droplets, Flame, Target,
  CheckCircle2, Plus, Minus
} from 'lucide-react';
import { fetchJsonWithAuth } from '@/src/lib/api-helper';
import { authService } from '@/src/services/authService';

interface DashboardSummary {
  todayWater: {
    amount: number;
    date: any;
  };
  waterGoal?: number;
  latestSleep: {
    totalHours: number;
    quality: string;
  } | null;
  todayMood: {
    mood: string;
    createdAt: any;
  } | null;
  activeHabits: any[];
  todayExercises: any[];
  wellnessScore: number;
  activeGoals?: any[];
}

export function Dashboard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingWater, setSavingWater] = useState(false);
  const [savingMood, setSavingMood] = useState(false);
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);
  
  // Real data from API
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  
  // Demo/Static data (used when not logged in) - removed dummy values
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [waterIntake] = useState(0);
  const [sleepHours] = useState(0);
  const [calories] = useState(0);

  const moods = [
    { id: 'happy', icon: Smile, label: 'Senang', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'neutral', icon: Meh, label: 'Biasa', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'sad', icon: Frown, label: 'Sedih', color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  const [completedHabits] = useState<number[]>([]);

  // Check if user is logged in and fetch real data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await fetch('/api/dashboard/summary', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setDashboardData(result.data);
            }
          }
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
        }
      }
      
      setLoading(false);
    };

    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Get display values (real data if logged in, empty otherwise)
  const displayWater = isLoggedIn && dashboardData?.todayWater ? dashboardData.todayWater.amount : waterIntake;
  const displayWaterGoal = isLoggedIn && dashboardData?.waterGoal ? dashboardData.waterGoal : 2.5;
  const displaySleep = isLoggedIn && dashboardData?.latestSleep ? dashboardData.latestSleep.totalHours : sleepHours;
  const displayMood = isLoggedIn && dashboardData?.todayMood ? dashboardData.todayMood.mood : mood;
  
  // Calculate calories from today's exercises
  const todayCalories = isLoggedIn && dashboardData?.todayExercises 
    ? dashboardData.todayExercises.reduce((sum: number, ex: any) => sum + (ex.calories || 0), 0)
    : 0;
  const displayCalories = todayCalories > 0 ? todayCalories : calories;
  
  // Calculate habits completed today - computed after mount to avoid hydration mismatch
  const [todayTime, setTodayTime] = useState(0);
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setTodayTime(today.getTime());
  }, []);
  
  const habitsCompletedToday = isLoggedIn && dashboardData?.activeHabits && todayTime
    ? dashboardData.activeHabits.filter((h: any) => {
        if (!h.completedDates || h.completedDates.length === 0) return false;
        return h.completedDates.some((dateItem: any) => {
          let date;
          
          // Handle different date formats from Firebase
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
      }).length
    : 0;
  
  // Fix: Use correct values based on login status
  const displayHabitsCompleted = isLoggedIn ? habitsCompletedToday : 0;
  const displayHabitsTotal = isLoggedIn && dashboardData?.activeHabits 
    ? dashboardData.activeHabits.length 
    : 0;

  console.log('Home Dashboard - Habits:', {
    isLoggedIn,
    habitsCompletedToday,
    displayHabitsCompleted,
    displayHabitsTotal,
    activeHabits: dashboardData?.activeHabits?.length,
  });

  // Save functions for logged-in users
  const handleSaveWater = async (amount: number) => {
    if (!isLoggedIn) return;
    
    setSavingWater(true);
    try {
      await fetchJsonWithAuth('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      // Refresh dashboard data
      const result = await fetchJsonWithAuth('/api/dashboard/summary');
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to save water:', error);
    } finally {
      setSavingWater(false);
    }
  };

  const handleSaveMood = async (newMood: string) => {
    if (!isLoggedIn) return;
    
    setSavingMood(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: newMood }),
      });

      if (response.ok) {
        // Refresh dashboard data
        const summaryRes = await fetch('/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await summaryRes.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to save mood:', error);
    } finally {
      setSavingMood(false);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    if (!isLoggedIn) return;
    
    try {
      console.log('Toggling habit on home page:', habitId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });

      console.log('Toggle response:', response.ok);

      if (response.ok) {
        // Refresh dashboard data
        const summaryRes = await fetch('/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await summaryRes.json();
        console.log('Refreshed data:', result);
        if (result.success) {
          setDashboardData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleAddWaterQuick = async (quickAmount: number) => {
    if (isLoggedIn) {
      await handleSaveWater(quickAmount);
    }
  };

  const handleRemoveWaterQuick = async () => {
    if (isLoggedIn) {
      await handleSaveWater(-0.25);
    }
  };

  const handleMoodClick = async (newMood: 'happy' | 'neutral' | 'sad') => {
    if (isLoggedIn) {
      await handleSaveMood(newMood);
    } else {
      setMood(newMood);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, increment: number) => {
    if (!isLoggedIn) return;
    
    setUpdatingGoal(goalId);
    try {
      const token = localStorage.getItem('token');
      const goal = dashboardData?.activeGoals?.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.max(0, Math.min(goal.currentValue + increment, goal.targetValue));
      
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentValue: newValue }),
      });

      if (response.ok) {
        // Refresh dashboard data
        const summaryRes = await fetch('/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await summaryRes.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setUpdatingGoal(null);
    }
  };

  return (
    <section id="dashboard" ref={sectionRef} className="py-20 lg:py-32 bg-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="reveal opacity-0 inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            Dashboard Interaktif
          </span>
          <h2 className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kesehatanmu dalam Satu Pandangan
          </h2>
          <p className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto">
            Pantau semua metrik kesehatanmu dalam satu dashboard yang indah dan mudah digunakan. 
            Klik kartu mana saja untuk berinteraksi dan perbarui progres harianmu.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mood Tracker */}
          <div className="reveal opacity-0 card-premium p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bagaimana perasaanmu?</h3>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <Smile className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <Smile className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">Masuk untuk mencatat suasana hatimu</p>
                <a href="/login" className="text-xs text-blue-600 hover:text-blue-700 font-medium underline">Masuk sekarang →</a>
              </div>
            ) : (
              <>
                <div className="flex gap-3" suppressHydrationWarning>
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMoodClick(m.id as any)}
                      disabled={savingMood}
                      suppressHydrationWarning
                      className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        displayMood === m.id
                          ? `${m.bg} border-current ${m.color}`
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {savingMood && displayMood === m.id ? (
                        <div className={`w-6 h-6 mx-auto mb-1 border-2 border-current border-t-transparent rounded-full animate-spin ${m.color}`} />
                      ) : (
                        <m.icon className={`w-6 h-6 mx-auto mb-1 ${displayMood === m.id ? m.color : 'text-gray-400'}`} />
                      )}
                      <span className={`text-xs font-medium ${displayMood === m.id ? m.color : 'text-gray-500'}`}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  {displayMood === 'happy' && "Senang melihatmu bahagia hari ini! 🎉"}
                  {displayMood === 'neutral' && "Hari biasa pun tetap berarti. 💙"}
                  {displayMood === 'sad' && "Tidak apa-apa merasa sedih. Sayangi dirimu. 💙"}
                  {displayMood === 'calm' && "Tenang dan damai. 🧘"}
                  {displayMood === 'stress' && "Tarik napas dalam. Kamu pasti bisa. 💪"}
                  {displayMood === 'tired' && "Istirahat itu penting. Jaga dirimu. 😴"}
                  {!displayMood && "Belum ada catatan mood hari ini."}
                </p>
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Klik untuk memperbarui dan menyimpan otomatis
                </p>
                <Link 
                  href="/dashboard/mood" 
                  className="mt-3 block text-center text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Lihat riwayat suasana hati →
                </Link>
              </>
            )}
          </div>

          {/* Sleep Tracker */}
          <Link href={isLoggedIn ? "/dashboard/sleep" : "/login"} className="reveal opacity-0 card-premium p-6 hover-lift block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Kualitas Tidur</h3>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <Moon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">Masuk untuk melihat data tidurmu</p>
                <span className="text-xs text-blue-600 font-medium underline">Masuk sekarang →</span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{displaySleep.toFixed(1)}</span>
                    <span className="text-gray-500">hours</span>
                  </div>
                  <div className="w-full mt-3 h-2 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${Math.min((displaySleep / 12) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {displaySleep >= 7 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Tidur nyenyak!</span>
                    </>
                  ) : displaySleep >= 5 ? (
                    <>
                      <BatteryMedium className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">Bisa lebih baik</span>
                    </>
                  ) : displaySleep > 0 ? (
                    <>
                      <BatteryLow className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600 font-medium">Butuh lebih banyak istirahat</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Belum ada data tidur hari ini</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-blue-600">✓ Data nyata dari akunmu</p>
              </>
            )}
          </Link>

          {/* Water Intake */}
          <div className="reveal opacity-0 card-premium p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Asupan Air</h3>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <Droplets className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">Masuk untuk mencatat asupan airmu</p>
                <a href="/login" className="text-xs text-blue-600 hover:text-blue-700 font-medium underline">Masuk sekarang →</a>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{displayWater.toFixed(1)}</span>
                    <span className="text-gray-500">L / {displayWaterGoal}L</span>
                  </div>
                  <div className="mt-3 progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${Math.min((displayWater / displayWaterGoal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3" suppressHydrationWarning>
                  <button 
                    onClick={handleRemoveWaterQuick}
                    disabled={displayWater <= 0 || savingWater}
                    suppressHydrationWarning
                    className="flex-1 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                  >
                    {savingWater ? (
                      <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">250ml</span>
                  </button>
                  <button 
                    onClick={() => handleAddWaterQuick(0.25)}
                    disabled={savingWater}
                    suppressHydrationWarning
                    className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingWater ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">250ml</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Tersimpan otomatis ke akunmu
                </p>
                <Link 
                  href="/dashboard/water" 
                  className="mt-3 block text-center text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Lihat riwayat lengkap →
                </Link>
              </>
            )}
          </div>

          {/* Exercise Tracker */}
          <Link href={isLoggedIn ? "/dashboard/exercise" : "/login"} className="reveal opacity-0 card-premium p-6 hover-lift block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Hari Ini</h3>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <Flame className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-3">Masuk untuk mencatat aktivitasmu</p>
                <span className="text-xs text-blue-600 font-medium underline">Masuk sekarang →</span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span className="text-4xl font-bold text-gray-900">{displayCalories}</span>
                    <span className="text-gray-500">kcal</span>
                  </div>
                  <p className="text-sm text-gray-600">Kalori terbakar hari ini</p>
                </div>
                {displayCalories > 0 ? (
                  <p className="mt-2 text-xs text-blue-600">✓ Data olahraga nyata dari akunmu</p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">Belum ada aktivitas tercatat hari ini</p>
                )}
              </>
            )}
          </Link>

          {/* Habit Tracker */}
          <div className="reveal opacity-0 card-premium p-6 hover-lift md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kebiasaan Harian</h3>
                <p className="text-sm text-gray-500">
                  {displayHabitsCompleted}/{displayHabitsTotal} selesai hari ini
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            
            {isLoggedIn && dashboardData?.activeHabits && dashboardData.activeHabits.length > 0 ? (
              /* Real Habits from Database */
              <div className="space-y-3">
                {dashboardData.activeHabits.slice(0, 5).map((habit: any) => {
                  const habitTodayTime = todayTime;
                  
                  const isCompletedToday = habit.completedDates?.some((dateItem: any) => {
                    let date;
                    
                    // Handle different date formats from Firebase
                    if (typeof dateItem === 'string') {
                      date = new Date(dateItem);
                    } else if (dateItem && typeof dateItem === 'object') {
                      if (dateItem._seconds) {
                        // Admin SDK format
                        date = new Date(dateItem._seconds * 1000);
                      } else if (dateItem.seconds) {
                        // Client SDK format
                        date = new Date(dateItem.seconds * 1000);
                      } else if (dateItem.toDate) {
                        // Firestore Timestamp with toDate method
                        date = dateItem.toDate();
                      } else {
                        date = new Date(dateItem);
                      }
                    } else {
                      return false;
                    }
                    
                    date.setHours(0, 0, 0, 0);
                    return date.getTime() === habitTodayTime;
                  }) || false;

                  console.log('Habit:', habit.name, 'Completed:', isCompletedToday, 'CompletedDates:', habit.completedDates);

                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      suppressHydrationWarning
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md ${
                        isCompletedToday
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {/* Checkmark Circle - Same as Dashboard */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompletedToday ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                      }`}>
                        {isCompletedToday && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </div>
                      
                      {/* Habit Icon */}
                      <div className="text-xl flex-shrink-0">
                        {habit.icon || '🎯'}
                      </div>
                      
                      {/* Habit Name */}
                      <span className={`flex-1 text-left font-medium ${
                        isCompletedToday ? 'text-gray-600 line-through' : 'text-gray-900'
                      }`}>
                        {habit.name}
                      </span>
                      
                      {/* Streak Badge */}
                      {habit.streak > 0 && (
                        <span className="text-xs text-orange-600 font-medium flex-shrink-0">
                          🔥 {habit.streak}
                        </span>
                      )}
                    </button>
                  );
                })}
                <a 
                  href="/dashboard/habits" 
                  className="block text-center mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Lihat Semua Kebiasaan
                </a>
              </div>
            ) : !isLoggedIn ? (
              /* Empty State for Not Logged In */
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">Masuk untuk melihat dan mengelola kebiasaanmu</p>
                <a
                  href="/login"
                  className="inline-block mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Masuk Sekarang
                </a>
              </div>
            ) : (
              /* Empty State for Logged In but No Habits */
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Belum ada kebiasaan
                </p>
                <a 
                  href="/dashboard/habits" 
                  className="inline-block mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Buat Kebiasaan Pertamamu
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
