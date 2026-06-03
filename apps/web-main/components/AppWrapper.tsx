"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { useThemeStore } from "@/store/useThemeStore";
import { useOSStore } from "@/store/useOSStore"; // 🚀 Naya Import: OS Store
import { Loader2 } from "lucide-react";
import GlobalChatWindow from "@/components/Chat/GlobalChatWindow"; 

export function AppWrapper({ children }: { children: React.ReactNode }) {
  // Alias de diya 'syncThemeWithCloud' taaki confusion na ho
  const { theme, syncWithCloud: syncThemeWithCloud } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); 

  // 1. Safe Initial Sync: Routing boundaries ke mutabik state control
  useEffect(() => {
    const triggerSync = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("hyper_id_token") : null;
      
      // 🛡️ BORDER SECURITY: In pages par cloud settings sync karne ki koi zaroorat nahi hai
      const isAuthOrOnboardingPage = 
        pathname === "/login" || 
        pathname === "/onboarding" || 
        pathname === "/register";

      // Redirect Guard: Agar token nahi hai aur protected route par hai toh login bhejo
      if (!token && !isAuthOrOnboardingPage) {
        router.push("/login");
        setIsHydrated(true);
        return;
      }

      // Agar auth page par hai ya token nahi hai, toh bina sync kiye block skip karo
      if (isAuthOrOnboardingPage || !token) {
        setIsHydrated(true);
        return;
      }

      try {
        // 🚀 DUAL CLOUD SYNC: Ab Theme aur OS dono ka data backend (Postgres) se aayega
        await Promise.all([
          syncThemeWithCloud(),
          useOSStore.getState().syncWithCloud() // Zustand ka direct access bina dependency loop ke
        ]);
      } catch (err) {
        console.error("⚠️ System Note: Settings or OS cloud sync bypassed or deferred during link hydration.");
      } finally {
        setIsHydrated(true); 
      }
    };

    triggerSync();
  }, [syncThemeWithCloud, pathname, router]);

  // 2. Theme Applier Engine (Fully Preserved & Optimized)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    
    const themeColor = theme === 'light-verdant' ? '#ffffff' : '#0a0a0a';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    
    if (theme === 'light-verdant') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  // Hydration check screen (Neural Link Loader)
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

  // 3. Render Components
  return (
    <>
      {children}
      <GlobalChatWindow />
    </>
  );
}