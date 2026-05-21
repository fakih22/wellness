'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, Search, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/src/components/DashboardLayout';

interface Journal {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: any;
}

export default function JournalPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    calm: '😌',
    neutral: '😐',
    tired: '😴',
    stress: '😰',
    sad: '😢',
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/journals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        const journalData = result.data?.journals || result.data || [];
        setJournals(journalData);
      }
    } catch (error) {
      console.error('Failed to fetch journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          mood,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setTitle('');
        setContent('');
        setMood('neutral');
        setTags('');
        setShowForm(false);
        fetchJournals();
      }
    } catch (error) {
      console.error('Failed to create journal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteJournal = async (journalId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus entri jurnal ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/journals/${journalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchJournals();
    } catch (error) {
      console.error('Failed to delete journal:', error);
    }
  };

  const filteredJournals = journals.filter(journal =>
    journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Journal">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Jurnalmu</h2>
            <p className="text-gray-600">Renungkan perjalanan wellnessmu</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Entri Baru
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari entri jurnal..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Entri Jurnal Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Beri judul pada entrimu..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bagaimana perasaanmu?</label>
                <div className="flex gap-2">
                  {Object.entries(moodEmojis).map(([key, emoji]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMood(key)}
                      className={`w-12 h-12 rounded-lg border-2 text-2xl transition-all ${
                        mood === key ? 'border-purple-500 bg-purple-50 scale-110' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis pikiranmu..."
                  required
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="mis. syukur, refleksi, tujuan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Entri'}
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

        {/* Journal Entries */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Tidak ada entri yang cocok dengan pencarianmu.' : 'Belum ada entri jurnal. Mulai menulis!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                Buat Entri
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJournals.map((journal) => {
              // Handle different date formats from Firebase
              let date;
              if (journal.createdAt && typeof journal.createdAt === 'object') {
                if (journal.createdAt._seconds) {
                  // Admin SDK format
                  date = new Date(journal.createdAt._seconds * 1000);
                } else if (journal.createdAt.seconds) {
                  // Client SDK format
                  date = new Date(journal.createdAt.seconds * 1000);
                } else if (journal.createdAt.toDate) {
                  // Firestore Timestamp with toDate method
                  date = journal.createdAt.toDate();
                } else {
                  date = new Date(journal.createdAt);
                }
              } else if (journal.createdAt) {
                date = new Date(journal.createdAt);
              } else {
                date = new Date(); // Fallback to current date
              }
              
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={journal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-3xl">{moodEmojis[journal.mood] || '😐'}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{journal.title}</h3>
                        <p className="text-sm text-gray-500">
                          {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                          {' pukul '}
                          {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteJournal(journal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{journal.content}</p>

                  {journal.tags && journal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {journal.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
