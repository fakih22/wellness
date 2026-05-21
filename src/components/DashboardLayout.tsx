'use client';

import { ReactNode } from 'react';
import { Activity, Home, LogOut, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
}

export function DashboardLayout({ children, title, showBackButton = true }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Vitality Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Beranda"
              >
                <Home className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  Beranda
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Dashboard"
              >
                <Activity className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  Dashboard
                </span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={user?.name?.split(' ')[0]}
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                suppressHydrationWarning
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
