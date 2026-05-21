'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  streak: number;
  bestStreak: number;
  completedDates: string[];
  isActive: boolean;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✓');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const iconOptions = ['✓', '💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '🎯', '⭐'];
  const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/habits?active=true', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) setHabits(result.data || []);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, icon, color, frequency: 'daily', targetDays: 7 }),
      });

      const result = await response.json();
      if (result.success) {
        setName('');
        setIcon('✓');
        setColor('#3B82F6');
        setShowForm(false);
        fetchHabits();
      }
    } catch (error) {
      console.error('Failed to create habit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      setToggling(habitId);
      const token = localStorage.getItem('token');
      
      // Optimistic UI update - update state immediately
      setHabits(prevHabits => 
        prevHabits.map(habit => {
          if (habit.id === habitId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if today is already in completedDates
            const isCurrentlyCompleted = habit.completedDates?.some((dateItem: any) => {
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
              return date.getTime() === today.getTime();
            }) || false;
            
            // Toggle completion
            let updatedCompletedDates;
            if (isCurrentlyCompleted) {
              // Remove today
              updatedCompletedDates = habit.completedDates.filter((dateItem: any) => {
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
                  return true;
                }
                date.setHours(0, 0, 0, 0);
                return date.getTime() !== today.getTime();
              });
            } else {
              // Add today
              updatedCompletedDates = [...(habit.completedDates || []), today.toISOString()];
            }
            
            // Update streak
            const newStreak = isCurrentlyCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1;
            
            return {
              ...habit,
              completedDates: updatedCompletedDates,
              streak: newStreak,
              bestStreak: Math.max(newStreak, habit.bestStreak || 0)
            };
          }
          return habit;
        })
      );
      
      // Send request to backend
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ date: new Date().toISOString() }),
      });
      
      if (response.ok) {
        // Fetch fresh data to ensure consistency
        await fetchHabits();
      } else {
        console.error('Failed to toggle habit');
        // Revert optimistic update on error
        await fetchHabits();
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      // Revert optimistic update on error
      await fetchHabits();
    } finally {
      setToggling(null);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus kebiasaan ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      console.log(`Habit ${habit.name}: No completed dates`);
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    console.log(`Checking habit ${habit.name}:`, {
      completedDates: habit.completedDates,
      todayTime: new Date(todayTime).toISOString()
    });
    
    const result = habit.completedDates.some((dateItem: any) => {
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
      
      // Compare dates (ignore time)
      date.setHours(0, 0, 0, 0);
      const matches = date.getTime() === todayTime;
      
      console.log(`  Date check:`, {
        dateItem,
        parsedDate: date.toISOString(),
        matches
      });
      
      return matches;
    });
    
    console.log(`Habit ${habit.name} completed today:`, result);
    return result;
  };

  return (
    <DashboardLayout title="Habit Tracker">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kebiasaanmu</h2>
            <p className="text-gray-600">Bangun kebiasaan lebih baik, satu hari dalam satu waktu</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Kebiasaan Baru
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Kebiasaan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kebiasaan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Minum 8 gelas air"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ikon</label>
                <div className="flex gap-2">
                  {iconOptions.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`w-12 h-12 rounded-lg border-2 text-2xl ${
                        icon === i ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-12 h-12 rounded-lg border-2 ${
                        color === c ? 'border-gray-900' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Membuat...' : 'Buat Kebiasaan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Habits List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Belum ada kebiasaan. Buat kebiasaan pertamamu!</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Buat Kebiasaan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => {
              const completed = isCompletedToday(habit);
              return (
                <div
                  key={habit.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                    completed 
                      ? 'border-green-500 shadow-lg shadow-green-500/20' 
                      : 'border-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: habit.color + '20' }}
                      >
                        {habit.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                          {completed && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              ✓ Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          🔥 {habit.streak} hari beruntun
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleHabit(habit.id)}
                    disabled={toggling === habit.id}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      completed
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 transform scale-105 hover:scale-110'
                        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 hover:scale-105'
                    } ${toggling === habit.id ? 'opacity-70 cursor-wait' : 'cursor-pointer'} disabled:cursor-not-allowed`}
                  >
                    {toggling === habit.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Memperbarui...</span>
                      </>
                    ) : completed ? (
                      <>
                        <Check className="w-5 h-5 animate-bounce" />
                        <span className="font-bold">✓ Selesai Hari Ini! 🎉</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Tandai Selesai</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    <p>Streak Terbaik: {habit.bestStreak} hari</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
