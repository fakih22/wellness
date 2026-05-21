'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Trash2, Download, Shield } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { useAuth } from '@/src/hooks/useAuth';

export default function SettingsPage() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    daily: true,
    weekly: true,
  });
  const [message, setMessage] = useState('');

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    setMessage('Pengaturan notifikasi diperbarui');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/export', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellness-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('Data berhasil diekspor');
      } else {
        setMessage('Gagal mengekspor data');
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Gagal mengekspor data');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Apakah kamu yakin ingin menghapus akunmu? Tindakan ini tidak dapat dibatalkan dan semua datamu akan dihapus secara permanen.'
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Ketik "HAPUS" untuk mengonfirmasi penghapusan akun:'
    );

    if (doubleConfirm !== 'HAPUS') {
      setMessage('Penghapusan akun dibatalkan');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        logout();
      } else {
        setMessage('Gagal menghapus akun');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setMessage('Gagal menghapus akun');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
          <p className="text-gray-600">Kelola akun dan preferensimu</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('berhasil') || message.includes('diperbarui')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifikasi
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifikasi Email</p>
                <p className="text-sm text-gray-500">Terima pembaruan melalui email</p>
              </div>
              <button
                onClick={() => handleNotificationChange('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifikasi Push</p>
                <p className="text-sm text-gray-500">Terima notifikasi push</p>
              </div>
              <button
                onClick={() => handleNotificationChange('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Ringkasan Harian</p>
                <p className="text-sm text-gray-500">Dapatkan ringkasan wellness harian</p>
              </div>
              <button
                onClick={() => handleNotificationChange('daily')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.daily ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.daily ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Laporan Mingguan</p>
                <p className="text-sm text-gray-500">Dapatkan laporan progres mingguan</p>
              </div>
              <button
                onClick={() => handleNotificationChange('weekly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.weekly ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.weekly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privasi & Keamanan
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Ekspor Datamu</p>
                  <p className="text-sm text-gray-500">Unduh semua data wellnessmu</p>
                </div>
              </div>
              <span className="text-blue-600 text-sm font-medium">Ekspor</span>
            </button>

            <div className="p-4 rounded-lg border border-gray-300 bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-gray-600" />
                <p className="font-medium text-gray-900">Ubah Kata Sandi</p>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Perubahan kata sandi dikelola melalui Database
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Zona Berbahaya
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-red-700 mb-3">
                Setelah kamu menghapus akun, tidak ada jalan kembali. Pastikan kamu yakin.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Hapus Akun
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Vitality Wellness Platform v1.0.0</p>
          <p className="mt-1">© 2026 Vitality. Semua hak dilindungi.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
