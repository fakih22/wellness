// Server Component

import { Navigation } from '@/src/components/Navigation';
import { Hero } from '@/src/components/Hero';
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/src/components/Dashboard').then(mod => mod.Dashboard));
const Statistics = dynamic(() => import('@/src/components/Statistics').then(mod => mod.Statistics));
const Features = dynamic(() => import('@/src/components/Features').then(mod => mod.Features));
const Articles = dynamic(() => import('@/src/components/Articles').then(mod => mod.Articles));
const Footer = dynamic(() => import('@/src/components/Footer').then(mod => mod.Footer));

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <Dashboard />
        <Statistics />
        <Features />
        <Articles />
      </main>
      <Footer />
    </div>
  );
}
