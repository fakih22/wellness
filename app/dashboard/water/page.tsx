'use client';

import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface WaterLog {
  id: string;
  amount: number;
  date: any;
}

export default function WaterPage() {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [todayWater, setTodayWater] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const dailyGoal = 2.5; // 2.5L daily goal

  useEffect(() => {
    fetchWaterLogs();
  }, []);

  const fetchWaterLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/water?days=7', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      console.log('Water logs response:', result); // Debug log
      
      if (result.success) {
        const logs = result.data || [];
        setWaterLogs(logs);
        
        // Calculate today's total by SUMMING all entries for today
        const today = new Date();
        const todayStr = today.toDateString();
        
        const todayTotal = logs.reduce((sum: number, log: WaterLog) => {
          let logDate;
          
          // Handle Firestore Admin SDK Timestamp format
          if (log.date && typeof log.date === 'object') {
            if (log.date._seconds) {
              // Admin SDK format: { _seconds, _nanoseconds }
              logDate = new Date(log.date._seconds * 1000);
            } else if (log.date.seconds) {
              // Client SDK format: { seconds, nanoseconds }
              logDate = new Date(log.date.seconds * 1000);
            } else {
              logDate = new Date(log.date);
            }
          } else {
            logDate = new Date(log.date);
          }
          
          // If this log is from today, add its amount to the sum
          if (logDate.toDateString() === todayStr) {
            console.log('Today log found:', log.amount, 'L'); // Debug
            return sum + log.amount;
          }
          
          return sum;
        }, 0);
        
        console.log('Today total water:', todayTotal, 'L'); // Debug log
        setTodayWater(todayTotal);
      }
    } catch (error) {
      console.error('Failed to fetch water logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login terlebih dahulu');
        return;
      }

      const response = await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const result = await response.json();
      if (result.success) {
        setAmount('');
        fetchWaterLogs();
      } else {
        setError(result.message || 'Gagal menambahkan air');
      }
    } catch (error: any) {
      console.error('Failed to add water:', error);
      setError('Gagal menambahkan air. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickAdd = async (value: number) => {
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login terlebih dahulu');
        return;
      }

      const response = await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: value }),
      });

      const result = await response.json();
      if (result.success) {
        fetchWaterLogs();
      } else {
        setError(result.message || 'Gagal menambahkan air');
      }
    } catch (error: any) {
      console.error('Failed to add water:', error);
      setError('Gagal menambahkan air. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const percentage = Math.min((todayWater / dailyGoal) * 100, 100);

  return (
    <DashboardLayout title="Water Intake">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Today's Progress */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-cyan-100 mb-2">Asupan Air Hari Ini</p>
              <p className="text-5xl font-bold">{todayWater.toFixed(1)}L</p>
              <p className="text-cyan-100 mt-2">Target: {dailyGoal}L</p>
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
                  strokeDasharray={`${2 * Math.PI * 56 * (percentage / 100)} ${2 * Math.PI * 56}`}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-cyan-100 text-sm mt-2">{percentage.toFixed(0)}% dari target harian</p>
        </div>

        {/* Quick Add/Subtract Buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Subtract Button */}
            <button
              onClick={() => quickAdd(-0.25)}
              disabled={submitting || todayWater <= 0}
              className="py-4 px-6 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <span className="text-2xl">−</span>
              <span>250ml</span>
            </button>
            
            {/* Add Button */}
            <button
              onClick={() => quickAdd(0.25)}
              disabled={submitting}
              className="py-4 px-6 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              <span className="text-2xl">+</span>
              <span>250ml</span>
            </button>
          </div>
          
          {/* Additional Quick Add Options */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Pilihan lainnya:</p>
            <div className="grid grid-cols-3 gap-2">
              {[0.5, 0.75, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => quickAdd(value)}
                  disabled={submitting}
                  className="py-2 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  +{value}L
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-3 text-center text-sm text-gray-500">
            ✓ Tersimpan otomatis ke akunmu
          </div>
        </div>

        {/* Custom Amount Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Jumlah Kustom</h3>
          <form onSubmit={handleAddWater} className="flex gap-3">
            <input
              type="number"
              step="0.1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Jumlah dalam liter"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
            />
            <button
              type="submit"
              disabled={submitting || !amount}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            7 Hari Terakhir
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : waterLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada catatan air. Mulai catat!</p>
          ) : (
            <div className="space-y-3">
              {waterLogs.map((log) => {
                // Handle different Timestamp formats
                let date;
                if (log.date && typeof log.date === 'object') {
                  if (log.date._seconds) {
                    date = new Date(log.date._seconds * 1000);
                  } else if (log.date.seconds) {
                    date = new Date(log.date.seconds * 1000);
                  } else {
                    date = new Date(log.date);
                  }
                } else {
                  date = new Date(log.date);
                }
                
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">
                        {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-600">{log.amount.toFixed(1)}L</p>
                      <p className="text-xs text-gray-500">{((log.amount / dailyGoal) * 100).toFixed(0)}% dari target</p>
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
