"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/useThemeStore";
import { Button } from "@/components/ui/button";
import { User, Zap, Settings, LayoutDashboard } from "lucide-react";

export function FloatingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // FIXED: isSettingsOpen ko yahan destructure kar liya hai
  const { theme, toggleSettings, isSettingsOpen } = useThemeStore();
  
  const [userName, setUserName] = useState<string | null>(null);

  const isLight = theme === 'light-verdant';
  const hiddenPages = ["/login", "/onboarding"];

  useEffect(() => {
    const token = localStorage.getItem("hyper_id_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.username);
      } catch (e) {
        console.error("Token parsing failed.");
      }
    }
  }, [pathname]);

  if (hiddenPages.includes(pathname)) return null;

  return (
    <nav className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-500
      ${isLight 
        ? 'bg-white/70 border-slate-200 shadow-lg' 
        : 'bg-black/40 border-white/10 shadow-[0_0_30px_rgba(var(--primary),0.05)]'
      }`}
    >
      
      {/* 1. Brand Logo */}
      <Link href="/" className={`font-black tracking-tighter flex items-center gap-2 transition-colors ${isLight ? 'text-slate-900' : 'text-primary'}`}>
        <Zap className={`w-5 h-5 ${isLight ? 'fill-slate-900' : 'fill-primary'}`} />
        <span className="hidden sm:block uppercase italic text-lg">Hyper</span>
      </Link>

      {/* 2. Navigation Links */}
      <div className="flex items-center gap-1 md:gap-4">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all
            ${pathname === '/dashboard' 
              ? 'bg-primary text-background shadow-[0_0_15px_rgba(var(--primary),0.3)]' 
              : `hover:bg-primary/10 ${isLight ? 'text-slate-600' : 'text-slate-400'}`
            }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden md:block">Dashboard</span>
        </Link>
      </div>

      {/* 3. Right Side: Profile & Settings */}
      <div className="flex items-center gap-2">
        {/* Profile Link */}
        <Link 
          href="/dashboard/profile"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all group
            ${pathname === '/dashboard/profile' 
              ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]' 
              : `${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10 hover:bg-white/10'}`
            }`}
        >
          <User className={`w-4 h-4 transition-colors ${pathname === '/dashboard/profile' ? 'text-primary' : (isLight ? 'text-slate-600' : 'text-primary')}`} />
          <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${pathname === '/dashboard/profile' ? 'text-foreground' : (isLight ? 'text-slate-600' : 'text-foreground/80')}`}>
            {userName || "Guest"}
          </span>
        </Link>

        {/* Settings Toggle - FIXED logic */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSettings}
          className={`rounded-full w-9 h-9 transition-all 
            ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400'} 
            ${isSettingsOpen ? 'bg-primary/10 text-primary rotate-90' : ''}`}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}