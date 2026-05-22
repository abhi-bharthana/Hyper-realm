"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { Loader2 } from "lucide-react";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { theme, syncWithCloud } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Initial Sync: Backend se user settings fetch karna
  useEffect(() => {
    const triggerSync = async () => {
      // syncWithCloud backend se GET request karega /api/settings par
      await syncWithCloud();
      setIsHydrated(true); 
    };

    triggerSync();
  }, [syncWithCloud]);

  // 2. Theme Applier: HTML attribute set karna taaki OKLCH variables aur Shadcn trigger ho
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Custom attribute hamare God-Level theme engine ke liye
    root.setAttribute('data-theme', theme);
    
    // Shadcn aur Tailwind dark mode compatibility ke liye class toggle
    // Agar theme 'light-verdant' nahi hai, toh use dark consider karenge
    if (theme === 'light-verdant') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  
  // Mobile address bar ka color badalne ke liye
    const themeColor = theme === 'light-verdant' ? '#ffffff' : '#0a0a0a';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);

    if (theme === 'light-verdant') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  // Hydration check taaki client-side settings load hone se pehle UI na chamke (Flicker prevention)
  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[999]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <Loader2 className="w-12 h-12 animate-spin text-lime-400 opacity-20" />
             <Loader2 className="w-12 h-12 animate-spin text-lime-400 absolute top-0 left-0 [animation-duration:1.5s]" />
          </div>
          <p className="text-lime-400 text-[10px] tracking-[0.4em] font-black uppercase animate-pulse">
            Establishing Neural Link
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}