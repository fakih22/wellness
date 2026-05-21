'use client';

import { useEffect, useRef, useState } from 'react';
import { Target, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';
import { fetchJsonWithAuth } from '@/src/lib/api-helper';
import { authService } from '@/src/services/authService';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  progress: number;
  deadline?: any;
  createdAt: any;
}

const categories = ['Kesehatan', 'Kebugaran', 'Wellness', 'Nutrisi', 'Kesehatan Mental', 'Lainnya'];

export function Statistics() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize auth listener for auto token refresh
    authService.initAuthListener();
    
    // Check auth and fetch goals
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchGoals();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const fetchGoals = async () => {
    try {
      const result = await fetchJsonWithAuth('/api/goals');
      if (result.success) {
        setGoals(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue || !unit) return;

    setSubmitting(true);
    try {
      const result = await fetchJsonWithAuth('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          targetValue: Number(targetValue),
          unit,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });

      if (result.success) {
        setTitle('');
        setDescription('');
        setCategory('Health');
        setTargetValue('');
        setUnit('kg');
        setDeadline('');
        setShowForm(false);
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateProgress = async (goalId: string, increment: number) => {
    setUpdatingProgress(goalId);
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.max(0, Math.min(goal.currentValue + increment, goal.targetValue));
      
      const response = await fetchJsonWithAuth(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: newValue }),
      });

      if (response.success) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdatingProgress(null);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus tujuan ini?')) return;
    
    try {
      await fetchJsonWithAuth(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <section id="statistics" ref={sectionRef} className="py-20 lg:py-32 gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white text-green-600 text-sm font-medium mb-4 shadow-sm">
            Progres
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pantau Progresmu
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tetapkan dan capai tujuan wellnessmu. Pantau progres dengan kontrol yang mudah digunakan.
          </p>
        </div>

        {!isLoggedIn ? (
          /* Not Logged In State */
          <div className="card-premium p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Mulai Lacak Tujuanmu</h3>
            <p className="text-gray-600 mb-8">
              Masuk untuk membuat dan melacak tujuan wellnessmu dengan kontrol progres.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/login" 
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Masuk
              </a>
              <a 
                href="/register" 
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Buat Akun
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Add New Goal Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Progress Baru
              </button>
            </div>

            {/* Create Form */}
            {showForm && (
              <div className="card-premium p-8 mb-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Buat Progress Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul Progress</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="mis. Turun 5 kg"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsikan tujuanmu..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Target</label>
                      <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="mis. 10"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Satuan</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="mis. kg, jam, hari"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tenggat Waktu (opsional)</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Membuat...' : 'Buat Tujuan'}
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

            {/* Goals List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : goals.length === 0 ? (
              <div className="card-premium p-12 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Tujuan</h3>
                <p className="text-gray-600 mb-6">Tetapkan tujuan wellness pertamamu dan mulai lacak progresmu!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Buat Tujuan Pertamamu
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active Goals */}
                {activeGoals.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Progress Aktif ({activeGoals.length})</h3>
                    <div className="space-y-4">
                      {activeGoals.map((goal) => {
                        const hasDeadline = goal.deadline && goal.deadline.seconds;
                        const deadlineDate = hasDeadline ? new Date(goal.deadline.seconds * 1000) : null;
                        const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                        
                        return (
                          <div key={goal.id} className="card-premium p-6 hover-lift">
                            <div className="flex items-center gap-6">
                              {/* Left: Goal Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    {goal.category}
                                  </span>
                                  {daysLeft !== null && daysLeft > 0 && (
                                    <span className="text-sm text-gray-500">
                                      {daysLeft} hari tersisa
                                    </span>
                                  )}
                                  <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="ml-auto p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{goal.title}</h4>
                                {goal.description && (
                                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                                )}

                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Progres: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                                    <span className="text-lg font-bold text-green-600">{goal.progress}%</span>
                                  </div>
                                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                                      style={{ width: `${goal.progress}%` }}
                                    />
                                  </div>
                                </div>

                                {deadlineDate && (
                                  <p className="text-sm text-gray-500">
                                    Tenggat: {deadlineDate.toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </p>
                                )}
                              </div>

                              {/* Right: Action Buttons */}
                              <div className="flex flex-col gap-3 flex-shrink-0">
                                <button
                                  onClick={() => updateProgress(goal.id, 1)}
                                  disabled={updatingProgress === goal.id || goal.currentValue >= goal.targetValue}
                                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md min-w-[140px]"
                                >
                                  {updatingProgress === goal.id ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="w-5 h-5" />
                                      <span>+1 {goal.unit}</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => updateProgress(goal.id, -1)}
                                  disabled={updatingProgress === goal.id || goal.currentValue <= 0}
                                  className="px-6 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-200 flex items-center justify-center gap-2 font-medium min-w-[140px]"
                                >
                                  {updatingProgress === goal.id ? (
                                    <div className="w-5 h-5 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <Minus className="w-5 h-5" />
                                      <span>-1 {goal.unit}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Goals */}
                {completedGoals.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tujuan Tercapai ({completedGoals.length})</h3>
                    <div className="space-y-4">
                      {completedGoals.map((goal) => (
                        <div key={goal.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                                    {goal.category}
                                  </span>
                                  <h4 className="text-lg font-bold text-gray-900">{goal.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Tercapai: {goal.targetValue} {goal.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">🎉</span>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
