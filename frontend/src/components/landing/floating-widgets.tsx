// src/components/landing/floating-widgets.tsx
// Floating decorative widgets used on the welcome page.

import React from 'react';
import { motion } from 'framer-motion';

export function FloatingWidgets() {
  return (
    <>
      {/* Top‑right glow */}
      <motion.div
        className="absolute top-20 right-20 w-[300px] h-[300px] bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      {/* Bottom‑left glow */}
      <motion.div
        className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-[#10B981]/5 rounded-full blur-[80px] pointer-events-none"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      />
    </>
  );
}
