// src/app/welcome/page.tsx
// Full Welcome page composed of landing components.

'use client';

import { LandingNavbar } from '@/components/landing/navbar';
import { LandingHero } from '@/components/landing/hero';
import { FloatingWidgets } from '@/components/landing/floating-widgets';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen bg-[#050816] text-white overflow-hidden">
      <LandingNavbar />
      <FloatingWidgets />
      <motion.main
        className="pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <LandingHero />
        {/* Additional sections can be added here (features, metrics, cta, footer) */}
      </motion.main>
    </div>
  );
}
