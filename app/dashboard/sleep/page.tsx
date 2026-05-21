'use client';

import { useState, useEffect } from 'react';
import { Moon, Calendar, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface SleepLog {
  id: string;
  sleepTime: any;
  wakeUpTime: any;
  totalHours: number;
  quality: string;
  note: string | null;
  createdAt: any;
}

const qualityOptions = [
  { value: 'excellent', label: 'Sangat Baik', emoji: '😴', color: 'text-green-600' },
  { value: 'good', label: 'Baik', emoji: '😊', color: 'text-blue-600' },
  { value: 'fair', label: 'Cukup', emoji: '😐', color: 'text-yellow-600' },
  { value: 'poor', label: 'Buruk', emoji: '😞', color: 'text-red-600' },
];

export default function SleepPage() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [sleepTime, setSleepTime] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('');
  const [quality, setQuality] = useState('good');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSleepLogs();
  }, []);

  const fetchSleepLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sleep?days=30&limit=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setSleepLogs(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sleep logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepTime || !wakeUpTime) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sleepTime: new Date(sleepTime).toISOString(),
          wakeUpTime: new Date(wakeUpTime).toISOString(),
          quality,
          note: note || null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSleepTime('');
        setWakeUpTime('');
        setQuality('good');
        setNote('');
        fetchSleepLogs();
      }
    } catch (error) {
      console.error('Failed to log sleep:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((sum, log) => sum + log.totalHours, 0) / sleepLogs.length
    : 0;

  const getQualityOption = (qualityValue: string) => {
    return qualityOptions.find(q => q.value === qualityValue) || qualityOptions[1];
  };

  return (
    <DashboardLayout title="Sleep Tracker">
      <div className="max-w-4xl mx-auto">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 mb-2">Rata-rata Tidur (30 Hari Terakhir)</p>
              <p className="text-5xl font-bold">{averageSleep.toFixed(1)}h</p>
              <p className="text-indigo-100 mt-2">
                {averageSleep >= 7 ? '✨ Luar biasa!' : averageSleep >= 6 ? '👍 Bagus' : '💤 Butuh lebih banyak istirahat'}
              </p>
            </div>
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
              <Moon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Log Sleep Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catat Tidurmu</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sleep Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Tidur
              </label>
              <input
                type="datetime-local"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Wake Up Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Bangun
              </label>
              <input
                type="datetime-local"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kualitas Tidur
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuality(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      quality === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <p className={`text-sm font-medium ${quality === option.value ? option.color : 'text-gray-700'}`}>
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
                placeholder="Bagaimana tidurmu? Ada mimpi?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Catat Tidur'}
            </button>
          </form>
        </div>

        {/* Sleep History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Riwayat Tidur
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : sleepLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada catatan tidur. Mulai catat!</p>
          ) : (
            <div className="space-y-3">
              {sleepLogs.map((log) => {
                // Robust timestamp parsing
                let sleepDate, wakeDate;
                
                try {
                  // Handle different timestamp formats
                  if (log.sleepTime && typeof log.sleepTime === 'object') {
                    if (log.sleepTime._seconds) {
                      sleepDate = new Date(log.sleepTime._seconds * 1000);
                    } else if (log.sleepTime.seconds) {
                      sleepDate = new Date(log.sleepTime.seconds * 1000);
                    } else {
                      sleepDate = new Date(log.sleepTime);
                    }
                  } else {
                    sleepDate = new Date(log.sleepTime);
                  }
                  
                  if (log.wakeUpTime && typeof log.wakeUpTime === 'object') {
                    if (log.wakeUpTime._seconds) {
                      wakeDate = new Date(log.wakeUpTime._seconds * 1000);
                    } else if (log.wakeUpTime.seconds) {
                      wakeDate = new Date(log.wakeUpTime.seconds * 1000);
                    } else {
                      wakeDate = new Date(log.wakeUpTime);
                    }
                  } else {
                    wakeDate = new Date(log.wakeUpTime);
                  }
                  
                  // Validate dates
                  if (isNaN(sleepDate.getTime())) sleepDate = new Date();
                  if (isNaN(wakeDate.getTime())) wakeDate = new Date();
                } catch (error) {
                  console.error('Date parsing error:', error);
                  sleepDate = new Date();
                  wakeDate = new Date();
                }
                
                const qualityOption = getQualityOption(log.quality);
                
                return (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {sleepDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sleepDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {' → '}
                          {wakeDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{log.totalHours.toFixed(1)}h</p>
                        <p className={`text-sm ${qualityOption.color}`}>
                          {qualityOption.emoji} {qualityOption.label}
                        </p>
                      </div>
                    </div>
                    {log.note && (
                      <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">{log.note}</p>
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
