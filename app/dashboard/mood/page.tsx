'use client';

import { useState, useEffect } from 'react';
import { Smile, Meh, Frown, Calendar, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface Mood {
  id: string;
  mood: string;
  note: string | null;
  createdAt: any;
}

const moodOptions = [
  { value: 'happy', label: 'Senang', emoji: '😊', color: 'from-green-400 to-green-500' },
  { value: 'calm', label: 'Tenang', emoji: '😌', color: 'from-blue-400 to-blue-500' },
  { value: 'neutral', label: 'Biasa', emoji: '😐', color: 'from-gray-400 to-gray-500' },
  { value: 'tired', label: 'Lelah', emoji: '😴', color: 'from-purple-400 to-purple-500' },
  { value: 'stress', label: 'Stres', emoji: '😰', color: 'from-orange-400 to-orange-500' },
  { value: 'sad', label: 'Sedih', emoji: '😢', color: 'from-red-400 to-red-500' },
];

export default function MoodPage() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/moods?period=week&limit=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setMoods(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mood: selectedMood, note: note || null }),
      });

      const result = await response.json();
      if (result.success) {
        setSelectedMood('');
        setNote('');
        fetchMoods();
      }
    } catch (error) {
      console.error('Failed to log mood:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodOption = (moodValue: string) => {
    return moodOptions.find(m => m.value === moodValue) || moodOptions[2];
  };

  return (
    <DashboardLayout title="Mood Tracker">
      <div className="max-w-4xl mx-auto">
        {/* Log Mood Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bagaimana perasaanmu hari ini?</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Mood Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectedMood === mood.value
                      ? `border-${mood.color.split('-')[1]}-500 bg-gradient-to-br ${mood.color} text-white shadow-lg scale-105`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <p className={`font-medium ${selectedMood === mood.value ? 'text-white' : 'text-gray-900'}`}>
                    {mood.label}
                  </p>
                </button>
              ))}
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tambahkan catatan (opsional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Apa yang ada di pikiranmu?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedMood || submitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Menyimpan...' : 'Catat Suasana Hati'}
            </button>
          </form>
        </div>

        {/* Mood History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Suasana Hati Terkini
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : moods.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada catatan suasana hati. Mulai catat!</p>
          ) : (
            <div className="space-y-3">
              {moods.map((mood) => {
                const moodOption = getMoodOption(mood.mood);
                
                // Safe date parsing
                let date;
                try {
                  if (mood.createdAt && typeof mood.createdAt === 'object') {
                    if (mood.createdAt._seconds) {
                      date = new Date(mood.createdAt._seconds * 1000);
                    } else if (mood.createdAt.seconds) {
                      date = new Date(mood.createdAt.seconds * 1000);
                    } else if (mood.createdAt.toDate) {
                      date = mood.createdAt.toDate();
                    } else {
                      date = new Date(mood.createdAt);
                    }
                  } else {
                    date = new Date(mood.createdAt);
                  }
                  
                  // Validate date
                  if (isNaN(date.getTime())) {
                    date = new Date();
                  }
                } catch (error) {
                  console.error('Date parsing error:', error);
                  date = new Date();
                }
                
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={mood.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${moodOption.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {moodOption.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{moodOption.label}</p>
                        <p className="text-sm text-gray-500">
                          {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                          {' pukul '}
                          {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {mood.note && (
                        <p className="text-sm text-gray-600 mt-2">{mood.note}</p>
                      )}
                    </div>
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
