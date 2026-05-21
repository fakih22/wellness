'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2, Edit2, Minus } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';

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

const categories = ['Health', 'Fitness', 'Wellness', 'Nutrition', 'Mental Health', 'Other'];

export default function GoalsPage() {
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

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) setGoals(result.data || []);
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          targetValue: Number(targetValue),
          unit,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });

      const result = await response.json();
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

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus tujuan ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const updateProgress = async (goalId: string, increment: number) => {
    setUpdatingProgress(goalId);
    try {
      const token = localStorage.getItem('token');
      const goal = goals.find(g => g.id === goalId);
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
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdatingProgress(null);
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <DashboardLayout title="Goals">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tujuanmu</h2>
            <p className="text-gray-600">Tetapkan dan capai tujuan wellnessmu</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tujuan Baru
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Tujuan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tujuan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="mis. Turun 5 kg"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan tujuanmu..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenggat Waktu (opsional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Belum ada tujuan. Tetapkan tujuan pertamamu!</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Buat Tujuan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tujuan Aktif ({activeGoals.length})</h3>
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    const hasDeadline = goal.deadline && goal.deadline.seconds;
                    const deadlineDate = hasDeadline ? new Date(goal.deadline.seconds * 1000) : null;
                    const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                    
                    return (
                      <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {goal.category}
                              </span>
                              {daysLeft !== null && daysLeft > 0 && (
                                <span className="text-sm text-gray-500">
                                  {daysLeft} hari tersisa
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">{goal.title}</h4>
                            {goal.description && (
                              <p className="text-gray-600 text-sm">{goal.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progres: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Progress Update Buttons */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => updateProgress(goal.id, -1)}
                            disabled={updatingProgress === goal.id || goal.currentValue <= 0}
                            className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 flex items-center justify-center gap-1"
                          >
                            {updatingProgress === goal.id ? (
                              <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Minus className="w-4 h-4" />
                            )}
                            <span>-1 {goal.unit}</span>
                          </button>
                          <button
                            onClick={() => updateProgress(goal.id, 1)}
                            disabled={updatingProgress === goal.id || goal.currentValue >= goal.targetValue}
                            className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            {updatingProgress === goal.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>+1 {goal.unit}</span>
                          </button>
                        </div>

                        {deadlineDate && (
                          <p className="text-sm text-gray-500">
                            Tenggat: {deadlineDate.toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tujuan Tercapai ({completedGoals.length})</h3>
                <div className="space-y-4">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="bg-green-50 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                          <p className="text-sm text-gray-600">{goal.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
