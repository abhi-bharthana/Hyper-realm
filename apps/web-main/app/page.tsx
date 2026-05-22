"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { theme } = useThemeStore();
  
  // Theme check for dynamic classes
  const isLight = theme === 'light-verdant';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      
      {/* Central Node - Subtle Animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-3xl">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
        </div>
        {/* Decorative Rings */}
        <div className="absolute inset-0 border border-primary/5 rounded-full scale-150 animate-[ping_3s_linear_infinite]" />
      </motion.div>

      {/* Placeholder Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground mb-4">
          Hyper <span className="text-primary">Realm</span>
        </h1>
        <p className="text-[10px] font-mono uppercase tracking-[0.6em] text-muted-foreground opacity-60">
          Node Established // System Ready
        </p>
      </motion.div>

      {/* Future Content Placeholder */}
      <div className="mt-12 w-full max-w-sm h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
    </div>
  );
}