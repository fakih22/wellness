'use client';

import { useEffect, useRef } from 'react';
import { 
  Brain, Moon, Target, Dumbbell, Apple, Sparkles,
  Zap, Shield, Users, LineChart, Bell, Heart
} from 'lucide-react';

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Brain,
      title: 'Analisis Suasana Hati',
      description: 'Pantau kesejahteraan emosionalmu dengan wawasan berbasis AI. Pahami pola suasana hatimu dan dapatkan rekomendasi personal.',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'from-purple-50 to-pink-50',
    },
    {
      icon: Moon,
      title: 'Pemantauan Tidur',
      description: 'Pelacakan tidur komprehensif dengan analisis kualitas. Dapatkan tips untuk istirahat lebih baik dan bangun rutinitas tidur sehat.',
      color: 'from-indigo-400 to-purple-400',
      bgColor: 'from-indigo-50 to-purple-50',
    },
    {
      icon: Target,
      title: 'Pembentukan Kebiasaan',
      description: 'Bangun kebiasaan yang bertahan dengan pengingat cerdas dan pelacakan streak. Sistem kami membantumu tetap konsisten dan termotivasi.',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50',
    },
    {
      icon: Dumbbell,
      title: 'Pelacakan Kebugaran',
      description: 'Catat olahraga, langkah, kalori, dan progres. Sinkronkan dengan perangkat kebugaran favoritmu untuk pemantauan yang mulus.',
      color: 'from-green-400 to-emerald-400',
      bgColor: 'from-green-50 to-emerald-50',
    },
    {
      icon: Apple,
      title: 'Pelacakan Nutrisi',
      description: 'Catat makanan dan pantau nutrisi dengan mudah. Dapatkan wawasan tentang pola makanmu dan saran diet yang dipersonalisasi.',
      color: 'from-orange-400 to-red-400',
      bgColor: 'from-orange-50 to-red-50',
    },
    {
      icon: Sparkles,
      title: 'Kesehatan Mental',
      description: 'Akses meditasi terpandu, latihan pernapasan, dan praktik mindfulness untuk mendukung perjalanan kesehatan mentalmu.',
      color: 'from-teal-400 to-cyan-400',
      bgColor: 'from-teal-50 to-cyan-50',
    },
  ];

  const additionalFeatures = [
    { icon: Zap,       title: 'Wawasan Cerdas',    desc: 'Rekomendasi kesehatan berbasis AI yang dipersonalisasi untukmu', gradient: 'from-yellow-400 to-orange-500', lightBg: 'from-yellow-50 to-orange-50',  iconColor: 'text-orange-500' },
    { icon: Shield,    title: 'Privasi Data',       desc: 'Data kesehatanmu dienkripsi dan aman sepenuhnya',               gradient: 'from-green-400 to-emerald-600', lightBg: 'from-green-50 to-emerald-50',  iconColor: 'text-emerald-600' },
    { icon: Users,     title: 'Komunitas',          desc: 'Terhubung & saling mendukung dengan sesama pengguna',           gradient: 'from-blue-400 to-cyan-500',    lightBg: 'from-blue-50 to-cyan-50',     iconColor: 'text-blue-500' },
    { icon: LineChart, title: 'Laporan Progres',    desc: 'Analitik mingguan & bulanan yang terperinci dan visual',        gradient: 'from-purple-400 to-pink-500',  lightBg: 'from-purple-50 to-pink-50',   iconColor: 'text-purple-500' },
    { icon: Bell,      title: 'Pengingat Cerdas',   desc: 'Notifikasi pintar agar kamu tidak melewatkan kebiasaan',       gradient: 'from-red-400 to-rose-500',     lightBg: 'from-red-50 to-rose-50',      iconColor: 'text-rose-500' },
    { icon: Heart,     title: 'Kesehatan Holistik', desc: 'Wellness menyeluruh — pikiran, tubuh & jiwa selaras',          gradient: 'from-pink-400 to-fuchsia-500', lightBg: 'from-pink-50 to-fuchsia-50',  iconColor: 'text-pink-500' },
  ];

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
      (el as HTMLElement).style.animationDelay = `${index * 0.05}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="reveal opacity-0 inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            Fitur
          </span>
          <h2 className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Semua yang Kamu Butuhkan untuk
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600"> Hidup Lebih Sehat</span>
          </h2>
          <p className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto">
            Alat komprehensif yang dirancang untuk membantumu mencapai tujuan wellness dan membangun kebiasaan sehat yang bertahan.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="reveal opacity-0 group relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ color: feature.color.includes('purple') ? '#A855F7' : feature.color.includes('indigo') ? '#6366F1' : feature.color.includes('blue') ? '#3B82F6' : feature.color.includes('green') ? '#22C55E' : feature.color.includes('orange') ? '#F97316' : '#14B8A6' }} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10`} />
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="reveal opacity-0 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50 border border-gray-100 p-8 lg:p-14">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4 border border-blue-200">
              ✦ Premium
            </span>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Semua yang Kamu Butuhkan, Dalam Satu Aplikasi
            </h3>
            <p className="text-gray-500 text-lg">Fitur premium untuk memaksimalkan perjalanan wellnessmu</p>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default"
              >
                {/* Top color bar */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.lightBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
