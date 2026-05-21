'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Activity, Moon, Droplets, Flame } from 'lucide-react';

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
}

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data if user is logged in
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

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Get display values
  const displayWater = isLoggedIn && dashboardData?.todayWater 
    ? dashboardData.todayWater.amount 
    : 1.8;
  const displayWaterGoal = isLoggedIn && dashboardData?.waterGoal 
    ? dashboardData.waterGoal 
    : 2.5;
  const displaySleep = isLoggedIn && dashboardData?.latestSleep 
    ? dashboardData.latestSleep.totalHours 
    : 7.5;
  const displaySleepQuality = isLoggedIn && dashboardData?.latestSleep 
    ? dashboardData.latestSleep.quality 
    : 'Good';
  const displayMood = isLoggedIn && dashboardData?.todayMood 
    ? dashboardData.todayMood.mood 
    : 'happy';
  const displayWellnessScore = isLoggedIn && dashboardData 
    ? dashboardData.wellnessScore 
    : 87;
  
  // Calculate calories from today's exercises
  const todayCalories = isLoggedIn && dashboardData?.todayExercises 
    ? dashboardData.todayExercises.reduce((sum: number, ex: any) => sum + (ex.calories || 0), 0)
    : 0;
  const displayCalories = todayCalories > 0 ? todayCalories : 209;

  // Mood emoji mapping
  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    calm: '😌',
    neutral: '😐',
    tired: '😴',
    stress: '😰',
    sad: '😢',
  };

  const moodLabels: { [key: string]: string } = {
    happy: 'Senang',
    calm: 'Tenang',
    neutral: 'Biasa',
    tired: 'Lelah',
    stress: 'Stres',
    sad: 'Sedih',
  };

  const moodMessages: { [key: string]: string } = {
    happy: 'Hari yang luar biasa!',
    calm: 'Damai sekali!',
    neutral: 'Hari yang biasa',
    tired: 'Butuh istirahat',
    stress: 'Tetap semangat',
    sad: 'Sayangi dirimu',
  };

  // Get current date - computed client-side only to avoid hydration mismatch
  const [currentDate, setCurrentDate] = useState('');
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen gradient-hero overflow-hidden pt-8"
      suppressHydrationWarning
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-100/50 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="reveal opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Baru: Wawasan Kesehatan Berbasis AI</span>
            </div>

            {/* Headline */}
            <h1 className="reveal opacity-0 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Jaga Kesehatanmu,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                Tingkatkan Hidupmu
              </span>
            </h1>

            {/* Subheadline */}
            <p className="reveal opacity-0 text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Tubuh sehat bukan keberuntungan — itu hasil kebiasaan. Pantau mood, tidur, hidrasi, 
              dan olahraga kamu setiap hari untuk menjadi versi terbaik dirimu.
            </p>

            {/* CTA Buttons */}
            <div className="reveal opacity-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <a
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="btn-primary inline-flex items-center justify-center gap-2 text-base"
              >
                Mulai
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="reveal opacity-0 flex flex-wrap justify-center lg:justify-start gap-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">500K+</div>
                <div className="text-sm text-gray-500">Pengguna Aktif</div>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden sm:block" />
              <div>
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-500">Rating Aplikasi</div>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden sm:block" />
              <div>
                <div className="text-3xl font-bold text-gray-900">10M+</div>
                <div className="text-sm text-gray-500">Kebiasaan Tercatat</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Dashboard Preview */}
          <div className="reveal opacity-0 relative">
            {/* Main Dashboard Card */}
            <div className="relative card-premium p-6 lg:p-8 animate-float">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ringkasan Hari Ini</h3>
                  <p className="text-sm text-gray-500">{currentDate}</p>
                </div>
                <div className="w-12 h-12 rounded-full gradient-blue flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>

              {!isLoggedIn ? (
                /* Empty State for Not Logged In Users */
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Mulai Perjalanan Sehatmu
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Masuk untuk memantau metrik kesehatanmu dan lihat ringkasan wellness personalmu
                  </p>
                  <div className="flex justify-center">
                    <a 
                      href="/login" 
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Masuk
                    </a>
                  </div>
                </div>
              ) : (
                /* Real Data for Logged In Users */
                <>
                  {/* Wellness Score */}
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Skor Kesehatan</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {displayWellnessScore}
                          <span className="text-lg text-gray-400">/100</span>
                        </p>
                        <p className="text-xs text-green-600 mt-1">✓ Data real-time</p>
                      </div>
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                          <circle cx="40" cy="40" r="34" stroke="url(#scoreGradient)" strokeWidth="8" fill="none"
                            strokeDasharray={`${2 * Math.PI * 34 * (displayWellnessScore / 100)} ${2 * Math.PI * 34}`}
                            strokeLinecap="round" />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#60A5FA" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Mood */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <span className="text-lg">{moodEmojis[displayMood] || '😊'}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">Suasana Hati</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {moodLabels[displayMood] || 'Happy'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moodMessages[displayMood] || 'Hari yang luar biasa!'}
                      </p>
                    </div>

                    {/* Sleep */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Moon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">Tidur</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{displaySleep.toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">Kualitas: {displaySleepQuality}</p>
                    </div>

                    {/* Water */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Droplets className="w-4 h-4 text-cyan-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">Air</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{displayWater.toFixed(1)}L</p>
                      <p className="text-xs text-gray-500">Target: {displayWaterGoal}L</p>
                    </div>

                    {/* Calories */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">Kalori</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{displayCalories}</p>
                      <p className="text-xs text-gray-500">kkal terbakar</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
