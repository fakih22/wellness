'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Clock, Eye, User, ChevronRight, BookOpen, Heart, Dumbbell, Apple, Moon, Brain } from 'lucide-react';

interface Article {
  id: number;
  category: string;
  categoryColor: string;
  categoryBg: string;
  icon: any;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  views: string;
  date: string;
  image: string;
  content: string[];
  tips: string[];
}

const articles: Article[] = [
  {
    id: 1,
    category: 'Pola Makan',
    categoryColor: 'text-green-700',
    categoryBg: 'bg-green-100',
    icon: Apple,
    title: '7 Kebiasaan Makan Sehat yang Mengubah Hidupmu',
    excerpt: 'Pola makan bukan soal diet ketat — ini soal membangun hubungan yang sehat dengan makanan setiap hari.',
    author: 'Dr. Sari Dewi, Ahli Gizi',
    readTime: '5 menit',
    views: '12.4K',
    date: '12 Mei 2026',
    image: '🥗',
    content: [
      'Makan sehat bukan berarti menyiksa diri dengan pantangan yang panjang ya. Justru sebaliknya — ini tentang membangun kebiasaan kecil yang konsisten dan berkelanjutan.',
      'Penelitian menunjukkan bahwa orang yang makan dengan penuh kesadaran (mindful eating) cenderung memiliki berat badan lebih stabil dan tingkat stres lebih rendah dibanding mereka yang diet ketat.',
      'Kunci utamanya adalah variasi. Piring yang penuh warna — sayuran hijau, protein tanpa lemak, karbohidrat kompleks, dan lemak sehat — memberikan semua nutrisi yang dibutuhkan tubuhmu.',
      'Jangan lupa hidrasi. Banyak orang salah mengira rasa haus sebagai rasa lapar. Minum segelas air sebelum makan bisa membantu mengontrol porsi secara alami.',
    ],
    tips: [
      'Makan perlahan dan kunyah 20-30 kali per suapan',
      'Isi setengah piring dengan sayuran berwarna-warni',
      'Pilih karbohidrat kompleks: nasi merah, oat, ubi unggu',
      'Batasi gula tambahan maksimal 25g per hari',
      'Sarapan dalam 1 jam setelah bangun tidur',
    ],
  },
  {
    id: 2,
    category: 'Olahraga',
    categoryColor: 'text-blue-700',
    categoryBg: 'bg-blue-100',
    icon: Dumbbell,
    title: 'Olahraga 30 Menit Sehari: Lebih Dari Cukup',
    excerpt: 'Kamu tidak perlu gym mahal atau waktu berjam-jam. 30 menit gerakan yang tepat sudah cukup mengubah kondisi tubuhmu.',
    author: 'Coach Bima Pratama',
    readTime: '4 menit',
    views: '9.8K',
    date: '8 Mei 2026',
    image: '🏃',
    content: [
      'WHO merekomendasikan minimal 150 menit aktivitas fisik sedang per minggu — artinya hanya 30 menit sehari, 5 hari seminggu. Angka yang sangat bisa dicapai siapa pun.',
      'Yang penting bukan intensitas ekstrem, tapi konsistensi. Jalan cepat 30 menit setiap hari jauh lebih bermanfaat daripada lari marathon sekali sebulan.',
      'Olahraga tidak harus di gym. Naik tangga, bersepeda ke kantor, atau sekadar stretching di rumah sudah memberikan manfaat nyata bagi kesehatan jantung dan metabolisme.',
      'Studi dari Harvard menunjukkan bahwa orang yang aktif bergerak 30 menit sehari memiliki risiko penyakit jantung 35% lebih rendah dan harapan hidup rata-rata 3-5 tahun lebih panjang.',
    ],
    tips: [
      'Mulai dengan 10 menit jika belum terbiasa, tambah bertahap',
      'Gabungkan cardio dan latihan kekuatan',
      'Jadwalkan olahraga seperti meeting — masukkan ke kalender',
      'Cari teman olahraga untuk menjaga motivasi',
      'Dengarkan podcast atau musik favorit saat berolahraga',
    ],
  },
  {
    id: 3,
    category: 'Tidur',
    categoryColor: 'text-indigo-700',
    categoryBg: 'bg-indigo-100',
    icon: Moon,
    title: 'Rahasia Tidur Berkualitas yang Jarang Diketahui',
    excerpt: 'Tidur 8 jam tapi masih lelah? Masalahnya bukan durasi — tapi kualitas. Ini cara memperbaikinya.',
    author: 'Dr. Rina Kusuma, Spesialis Tidur',
    readTime: '6 menit',
    views: '15.2K',
    date: '5 Mei 2026',
    image: '😴',
    content: [
      'Kualitas tidur ditentukan oleh siklus tidur yang lengkap, bukan sekadar durasi. Satu siklus tidur berlangsung sekitar 90 menit, dan idealnya kamu menyelesaikan 4-6 siklus per malam.',
      'Cahaya biru dari layar ponsel dan laptop menekan produksi melatonin — hormon tidur alami tubuh. Hindari layar minimal 1 jam sebelum tidur untuk tidur yang lebih nyenyak.',
      'Suhu kamar yang ideal untuk tidur adalah 18-20°C. Tubuh perlu menurunkan suhu intinya untuk masuk ke fase tidur dalam (deep sleep).',
      'Konsistensi jadwal tidur lebih penting dari durasi. Tidur dan bangun di jam yang sama setiap hari — termasuk akhir pekan — menjaga ritme sirkadian tetap stabil.',
    ],
    tips: [
      'Matikan layar 1 jam sebelum tidur ya',
      'Jaga suhu kamar 18-20°C',
      'Hindari kafein setelah pukul 14.00',
      'Buat rutinitas malam: mandi hangat, baca buku, meditasi',
      'Gunakan tirai blackout untuk kegelapan maksimal',
    ],
  },
  {
    id: 4,
    category: 'Kesehatan Mental',
    categoryColor: 'text-purple-700',
    categoryBg: 'bg-purple-100',
    icon: Brain,
    title: 'Stres Bukan Musuh — Ini Cara Mengelolanya dengan benar.',
    excerpt: 'Sedikit stres itu normal dan bahkan berguna. Yang berbahaya adalah stres kronis yang tidak dikelola dengan baik.',
    author: 'Psikolog Andini Rahayu, M.Psi',
    readTime: '7 menit',
    views: '18.6K',
    date: '2 Mei 2026',
    image: '🧠',
    content: [
      'Stres adalah respons alami tubuh terhadap tantangan sehari-hari. Dalam dosis kecil, stres justru meningkatkan fokus, produktivitas, dan kemampuan memecahkan masalah.',
      'Masalah muncul ketika stres menjadi kronis — berlangsung terus-menerus tanpa jeda pemulihan. Ini yang memicu berbagai penyakit fisik dan mental jangka panjang.',
      'Teknik pernapasan 4-7-8 terbukti secara ilmiah mengaktifkan sistem saraf parasimpatik dalam hitungan menit: tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik.',
      'Journaling atau menulis jurnal harian selama 10-15 menit terbukti mengurangi kecemasan dan membantu memproses emosi yang terpendam secara lebih sehat.',
    ],
    tips: [
      'Praktikkan pernapasan 4-7-8 saat merasa overwhelmed',
      'Tulis 3 hal yang kamu syukuri setiap pagi',
      'Batasi konsumsi berita negatif',
      'Luangkan waktu untuk hobi minimal 30 menit sehari',
      'Jangan ragu minta bantuan profesional jika perlu',
    ],
  },
  {
    id: 5,
    category: 'Hidrasi',
    categoryColor: 'text-cyan-700',
    categoryBg: 'bg-cyan-100',
    icon: Heart,
    title: 'Air Putih: Obat Paling Murah yang Sering Dilupakan',
    excerpt: '75% tubuhmu adalah air. Dehidrasi ringan saja sudah cukup menurunkan konsentrasi dan energimu hingga 20%.',
    author: 'Dr. Fajar Nugroho, Dokter Umum',
    readTime: '4 menit',
    views: '11.3K',
    date: '28 Apr 2026',
    image: '💧',
    content: [
      'Dehidrasi ringan — kehilangan hanya 1-2% cairan tubuh — sudah cukup menyebabkan sakit kepala, sulit konsentrasi, dan penurunan performa fisik yang signifikan.',
      'Kebutuhan air setiap orang berbeda tergantung berat badan, aktivitas, dan iklim. Rumus sederhana: berat badan (kg) × 0.033 = kebutuhan air harian dalam liter.',
      'Air putih bukan satu-satunya sumber hidrasi. Buah-buahan seperti semangka, mentimun, dan jeruk mengandung 90%+ air dan juga memberikan elektrolit alami.',
      'Tanda tubuh terhidrasi dengan baik: urin berwarna kuning pucat hingga bening. Urin gelap adalah sinyal jelas bahwa kamu perlu minum lebih banyak.',
    ],
    tips: [
      'Minum segelas air segera setelah bangun tidur',
      'Bawa botol minum ke mana pun kamu pergi',
      'Set pengingat minum air setiap 2 jam',
      'Minum air sebelum merasa haus — haus artinya sudah dehidrasi',
      'Tambahkan irisan lemon atau mint untuk variasi rasa',
    ],
  },
  {
    id: 6,
    category: 'Kebiasaan',
    categoryColor: 'text-orange-700',
    categoryBg: 'bg-orange-100',
    icon: BookOpen,
    title: 'Ilmu di Balik Pembentukan Kebiasaan Baru',
    excerpt: 'Butuh 21 hari membentuk kebiasaan? Mitos. Penelitian terbaru menunjukkan angka yang berbeda — dan cara yang lebih efektif.',
    author: 'Penulis: Tim Vitality',
    readTime: '5 menit',
    views: '22.1K',
    date: '25 Apr 2026',
    image: '⚡',
    content: [
      'Penelitian dari University College London menemukan bahwa rata-rata dibutuhkan 66 hari — bukan 21 hari — untuk membentuk kebiasaan baru hingga menjadi otomatis.',
      'Kunci pembentukan kebiasaan adalah "habit loop": pemicu (cue) → rutinitas (routine) → hadiah (reward). Memahami loop ini memungkinkan kamu merancang kebiasaan yang lebih mudah bertahan.',
      'Strategi "habit stacking" — menempelkan kebiasaan baru pada kebiasaan yang sudah ada — terbukti jauh lebih efektif daripada memulai dari nol. Contoh: setelah sikat gigi, langsung meditasi 5 menit.',
      'Mulai sangat kecil. James Clear dalam Atomic Habits menyebut ini "2-minute rule": jika kebiasaan baru bisa dimulai dalam 2 menit, hambatan untuk memulainya hampir tidak ada.',
    ],
    tips: [
      'Mulai dengan versi terkecil dari kebiasaan yang ingin dibentuk',
      'Tempelkan kebiasaan baru pada rutinitas yang sudah ada',
      'Rayakan setiap kemenangan kecil — dopamin adalah temanmu',
      'Jangan lewatkan 2 hari berturut-turut jika gagal',
      'Lacak progresmu secara visual — streak chart sangat memotivasi',
    ],
  },
];

const motivations = [
  {
    quote: 'Tubuhmu mendengar semua yang dikatakan pikiranmu. Jadilah baik pada dirimu sendiri.',
    author: 'Naomi Judd',
    emoji: '💪',
  },
  {
    quote: 'Kesehatan bukan segalanya, tapi tanpa kesehatan, segalanya bukan apa-apa.',
    author: 'Arthur Schopenhauer',
    emoji: '🌟',
  },
  {
    quote: 'Investasi terbaik yang bisa kamu lakukan adalah pada dirimu sendiri.',
    author: 'Warren Buffett',
    emoji: '🎯',
  },
  {
    quote: 'Jaga tubuhmu. Itu satu-satunya tempat yang kamu miliki untuk hidup.',
    author: 'Jim Rohn',
    emoji: '🏆',
  },
  {
    quote: 'Setiap hari adalah kesempatan baru untuk menjadi lebih sehat dari kemarin.',
    author: 'Vitality',
    emoji: '🌱',
  },
];

export function Articles() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentMotivation, setCurrentMotivation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMotivation(prev => (prev + 1) % motivations.length);
    }, 4000);
    return () => clearInterval(interval);
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
      (el as HTMLElement).style.animationDelay = `${index * 0.08}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedArticle]);

  return (
    <>
      <section id="articles" ref={sectionRef} className="py-20 lg:py-32 bg-white" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Motivasi Harian ── */}
          <div className="reveal opacity-0 mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 lg:p-12 text-white shadow-2xl">
              {/* decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

              <div className="relative text-center max-w-3xl mx-auto">
                <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-8">✨ Motivasi Hari Ini</p>

                {/* Single active slide — no absolute positioning */}
                <div className="transition-opacity duration-500">
                  <span className="text-6xl block mb-6 leading-none">
                    {motivations[currentMotivation].emoji}
                  </span>
                  <blockquote className="text-xl lg:text-2xl font-semibold leading-relaxed mb-4 px-2">
                    &ldquo;{motivations[currentMotivation].quote}&rdquo;
                  </blockquote>
                  <cite className="text-blue-200 not-italic text-sm font-medium">
                    — {motivations[currentMotivation].author}
                  </cite>
                </div>

                {/* dots */}
                <div className="flex justify-center gap-2 mt-10">
                  {motivations.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentMotivation(i)}
                      aria-label={`Motivasi ${i + 1}`}
                      suppressHydrationWarning
                      className={`rounded-full transition-all duration-300 ${
                        i === currentMotivation ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section Header ── */}
          <div className="text-center mb-12 lg:mb-16">
            <span className="reveal opacity-0 inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-sm font-medium mb-4">
              Artikel Kesehatan
            </span>
            <h2 className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pengetahuan untuk{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                Hidup Lebih Sehat
              </span>
            </h2>
            <p className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto">
              Artikel pilihan dari para ahli kesehatan — praktis, berbasis riset, dan mudah diterapkan dalam kehidupan sehari-hari.
            </p>
          </div>

          {/* ── Article Grid ── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="reveal opacity-0 group bg-white rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Card top color bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${
                  article.id % 3 === 0 ? 'from-purple-400 to-pink-400' :
                  article.id % 3 === 1 ? 'from-blue-400 to-cyan-400' :
                  'from-green-400 to-emerald-400'
                }`} />

                <div className="p-6">
                  {/* Emoji + category */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${article.categoryBg} ${article.categoryColor}`}>
                      {article.category}
                    </span>
                    <span className="text-4xl">{article.image}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{article.author.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {article.views}
                      </span>
                    </div>
                  </div>

                  {/* Read more */}
                  <div className="mt-4 flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Baca selengkapnya <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Article Modal ── */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className={`h-2 w-full rounded-t-3xl bg-gradient-to-r ${
              selectedArticle.id % 3 === 0 ? 'from-purple-400 to-pink-400' :
              selectedArticle.id % 3 === 1 ? 'from-blue-400 to-cyan-400' :
              'from-green-400 to-emerald-400'
            }`} />

            <div className="p-6 lg:p-8">
              {/* Close */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Category + emoji */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedArticle.categoryBg} ${selectedArticle.categoryColor}`}>
                  {selectedArticle.category}
                </span>
                <span className="text-3xl">{selectedArticle.image}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {selectedArticle.title}
              </h2>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime} baca
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.views} pembaca
                </span>
                <span className="text-gray-400">{selectedArticle.date}</span>
              </div>

              {/* Excerpt highlight */}
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4 mb-6">
                <p className="text-blue-800 font-medium italic">{selectedArticle.excerpt}</p>
              </div>

              {/* Content paragraphs */}
              <div className="space-y-4 mb-8">
                {selectedArticle.content.map((para, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">✅</span> Tips Praktis
                </h4>
                <ul className="space-y-2.5">
                  {selectedArticle.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-700 text-sm">
                      <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
