'use client';

import { useEffect, useRef, useState } from 'react';
import { Quote, Trophy, Star, Users, TrendingUp, Target, Flame, Award } from 'lucide-react';

export function Community() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      category: 'Hidrasi',
      icon: DropletsIcon,
      tip: 'Minum segelas air di pagi hari untuk memulai metabolisme dan menghidrasi tubuh setelah tidur.',
      color: 'cyan',
    },
    {
      category: 'Tidur',
      icon: MoonIcon,
      tip: 'Pertahankan jadwal tidur yang konsisten, bahkan di akhir pekan. Jam biologis tubuhmu menyukai rutinitas.',
      color: 'indigo',
    },
    {
      category: 'Gerak',
      icon: FootprintsIcon,
      tip: 'Ambil jeda berjalan 5 menit setiap jam. Gerakan kecil sepanjang hari memberikan manfaat kesehatan yang besar.',
      color: 'green',
    },
    {
      category: 'Mindfulness',
      icon: BrainIcon,
      tip: 'Praktikkan teknik pernapasan 4-7-8: tarik napas 4 hitungan, tahan 7, hembuskan 8. Ampuh untuk ketenangan instan.',
      color: 'purple',
    },
  ];

  const milestones = [
    { icon: Trophy, label: 'Streak 7 Hari', desc: 'Catat mood setiap hari', achieved: true },
    { icon: Target, label: 'Penghancur Target', desc: '10K langkah 5 hari', achieved: true },
    { icon: Flame, label: 'Pahlawan Hidrasi', desc: '2L air 7 hari', achieved: false },
    { icon: Award, label: 'Master Tidur', desc: '8 jam selama 30 hari', achieved: false },
  ];

  const quotes = [
    { text: "Jaga tubuhmu. Itu satu-satunya tempat yang kamu miliki untuk hidup.", author: "Jim Rohn" },
    { text: "Kesehatan bukan tentang berat yang kamu turunkan, tapi tentang kehidupan yang kamu raih.", author: "Anonim" },
    { text: "Langkah kecil setiap hari menghasilkan hasil besar seiring waktu.", author: "Anonim" },
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000);

    return () => {
      clearInterval(tipInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="community" ref={sectionRef} className="py-20 lg:py-32 gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="reveal opacity-0 inline-block px-4 py-1.5 rounded-full bg-white text-blue-600 text-sm font-medium mb-4 shadow-sm">
            Komunitas & Motivasi
          </span>
          <h2 className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tetap Terinspirasi & Terhubung
          </h2>
          <p className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan orang dalam perjalanan wellness mereka. Bagikan progres, dapatkan tips, dan tetap termotivasi bersama.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Tip Card */}
          <div className="reveal opacity-0 card-premium p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tips Kesehatan Harian</h3>
                <p className="text-sm text-gray-500">Dikurasi untuk wellnessmu</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    currentTip === index 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 absolute inset-0 translate-x-4'
                  }`}
                >
                  <div className={`p-6 rounded-2xl bg-gradient-to-br from-${tip.color}-50 to-white border border-${tip.color}-100`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${tip.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <tip.icon className={`w-6 h-6 text-${tip.color}-600`} />
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${tip.color}-100 text-${tip.color}-700 mb-2`}>
                          {tip.category}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{tip.tip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tip Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {tips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTip(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentTip === index ? 'bg-blue-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Motivational Quote Card */}
          <div className="reveal opacity-0 card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Quote className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Inspirasi Harian</h3>
                <p className="text-sm text-gray-500">Kata-kata untuk direnungkan</p>
              </div>
            </div>
            
            <div className="relative min-h-[140px]">
              {quotes.map((quote, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    currentQuote === index 
                      ? 'opacity-100' 
                      : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <blockquote className="text-gray-700 italic mb-4 leading-relaxed">
                    "{quote.text}"
                  </blockquote>
                  <cite className="text-sm text-gray-500 not-italic">— {quote.author}</cite>
                </div>
              ))}
            </div>

            {/* Quote Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentQuote === index ? 'bg-purple-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progress Milestones */}
          <div className="reveal opacity-0 card-premium p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pencapaianmu</h3>
                  <p className="text-sm text-gray-500">2 dari 4 tercapai bulan ini</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Terus semangat!</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    milestone.achieved
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    milestone.achieved ? 'bg-amber-500' : 'bg-gray-200'
                  }`}>
                    <milestone.icon className={`w-5 h-5 ${milestone.achieved ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <h4 className={`font-semibold text-sm ${milestone.achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                    {milestone.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{milestone.desc}</p>
                  {milestone.achieved && (
                    <div className="mt-3 flex items-center gap-1 text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-medium">Tercapai!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="reveal opacity-0 card-premium p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Komunitas</h3>
                <p className="text-sm text-blue-100">Bergabunglah dengan gerakan ini</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                <span className="text-sm text-blue-100">Anggota Aktif</span>
                <span className="text-xl font-bold">500K+</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                <span className="text-sm text-blue-100">Target Tercapai</span>
                <span className="text-xl font-bold">2.1M</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                <span className="text-sm text-blue-100">Check-in Harian</span>
                <span className="text-xl font-bold">150K</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-xl bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors">
              Bergabung dengan Komunitas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icon components for tips
function DropletsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function FootprintsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
