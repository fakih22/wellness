'use client';

import { useState, useEffect } from 'react';
import { Heart, Mail, MapPin, Link2, Share2 } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';

export function Footer() {
  const { isAuthenticated } = useAuth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    product: [
      { name: 'Fitur', href: '#features' },
      { name: 'Dashboard', href: '#dashboard' },
      { name: 'Goals', href: '#statistics' },
      { name: 'Aplikasi Mobile', href: '#' },
      { name: 'Harga', href: '#' },
    ],
    company: [
      { name: 'Tentang Kami', href: '#' },
      { name: 'Karir', href: '#' },
      { name: 'Pers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Kontak', href: '#' },
    ],
    resources: [
      { name: 'Pusat Bantuan', href: '#' },
      { name: 'Komunitas', href: '#articles' },
      { name: 'Kebijakan Privasi', href: '#' },
      { name: 'Syarat Layanan', href: '#' },
      { name: 'Kebijakan Cookie', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Share2, href: '#', label: 'Twitter' },
    { icon: Share2, href: '#', label: 'Instagram' },
    { icon: Link2, href: '#', label: 'LinkedIn' },
    { icon: Link2, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="bg-gray-900 text-white" suppressHydrationWarning>
      {/* CTA Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Mulai Perjalanan Sehatmu Hari Ini
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Bergabunglah dengan lebih dari 500.000 orang yang telah mengubah kesehatan mereka bersama Vitality. 
              Versi terbaik dirimu hanya selangkah lagi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={isAuthenticated ? '/dashboard' : '/login'} className="btn-primary text-base px-8 py-4">
                Mulai
              </a>
              <a href="#features" className="btn-secondary text-base px-8 py-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">Vitality</span>
            </a>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Teman wellness all-in-one kamu. Pantau, analisis, dan tingkatkan kesehatanmu dengan alat yang indah dan intuitif.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:hello@vitality.app" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                hello@vitality.app
              </a>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                Jakarta, Indonesia
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Produk
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Perusahaan
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Sumber Daya
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Tetap Update
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Dapatkan tips kesehatan terbaru dan pembaruan aplikasi.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Masukkan emailmu"
                suppressHydrationWarning
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
              >
                Daftar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              {currentYear} Vitality. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
