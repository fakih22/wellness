'use client';

import { useState, useEffect } from 'react';
import { Footprints, Plus, Calendar, Flame } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface Exercise {
  id: string;
  type: string;
  duration: number;
  calories: number;
  intensity: string;
  note: string | null;
  createdAt: any;
}

const exerciseTypes = [
  'Lari', 'Jalan Kaki', 'Bersepeda', 'Renang', 'Yoga', 'Gym', 'Menari', 'Olahraga', 'Lainnya'
];

const intensityOptions = [
  { value: 'low', label: 'Ringan', color: 'text-green-600' },
  { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
  { value: 'high', label: 'Tinggi', color: 'text-orange-600' },
  { value: 'extreme', label: 'Ekstrem', color: 'text-red-600' },
];

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      console.log('Fetching exercises...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exercise?period=week&limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      console.log('Fetch exercises result:', result);
      
      if (result.success) {
        setExercises(result.data || []);
        console.log('Exercises loaded:', result.data?.length || 0);
      } else {
        console.error('Failed to fetch exercises:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !duration || !calories) return;

    console.log('Submitting exercise:', { type, duration, calories, intensity, note });
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          duration: parseInt(duration),
          calories: parseInt(calories),
          intensity,
          note: note || null,
        }),
      });

      const result = await response.json();
      console.log('Exercise submit result:', result);
      
      if (result.success) {
        console.log('Exercise logged successfully, refreshing list...');
        setType('');
        setDuration('');
        setCalories('');
        setIntensity('medium');
        setNote('');
        await fetchExercises();
      } else {
        console.error('Failed to log exercise:', result.message);
        alert('Failed to log exercise: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to log exercise:', error);
      alert('Failed to log exercise. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);

  return (
    <DashboardLayout title="Exercise Tracker">
      <div className="max-w-4xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 mb-2">Total Kalori (Minggu Ini)</p>
                <p className="text-4xl font-bold">{totalCalories}</p>
                <p className="text-orange-100 mt-2">kkal terbakar</p>
              </div>
              <Flame className="w-16 h-16 text-white opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Total Durasi (Minggu Ini)</p>
                <p className="text-4xl font-bold">{totalDuration}</p>
                <p className="text-blue-100 mt-2">menit</p>
              </div>
              <Footprints className="w-16 h-16 text-white opacity-50" />
            </div>
          </div>
        </div>

        {/* Log Exercise Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catat Olahraga</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Olahraga
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              >
                <option value="">Pilih jenis olahraga</option>
                {exerciseTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Duration and Calories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi (menit)
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kalori Terbakar
                </label>
                <input
                  type="number"
                  min="1"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="200"
                />
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensitas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {intensityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIntensity(option.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      intensity === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-sm font-medium ${intensity === option.value ? option.color : 'text-gray-700'}`}>
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (opsional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bagaimana olahraganya?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {submitting ? 'Menyimpan...' : 'Catat Olahraga'}
            </button>
          </form>
        </div>

        {/* Exercise History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Olahraga Terkini
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : exercises.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada olahraga tercatat. Mulai catat!</p>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise) => {
                const date = new Date(exercise.createdAt.seconds * 1000);
                const isToday = date.toDateString() === new Date().toDateString();
                const intensityOption = intensityOptions.find(i => i.value === exercise.intensity);
                
                return (
                  <div key={exercise.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{exercise.type}</p>
                        <p className="text-sm text-gray-500">
                          {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                          {' pukul '}
                          {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{exercise.calories}</p>
                        <p className="text-xs text-gray-500">kkal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>⏱️ {exercise.duration} menit</span>
                      <span className={intensityOption?.color}>
                        💪 {intensityOption?.label}
                      </span>
                    </div>
                    {exercise.note && (
                      <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">{exercise.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
