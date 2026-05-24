"use client";

import Link from "next/link";
import { LayoutDashboard, Zap } from "lucide-react";

interface BrandBlockProps {
  isLight: boolean;
}

export function BrandBlock({ isLight }: BrandBlockProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Home Logo */}
      <Link 
        href="/" 
        className={`font-black tracking-tighter flex items-center gap-2 transition-colors ${
          isLight ? 'text-slate-900' : 'text-primary'
        }`}
      >
        <Zap className={`w-5 h-5 ${isLight ? 'fill-slate-900' : 'fill-primary'}`} />
      </Link>

      {/* Dashboard Anchor */}
      <div className="flex items-center gap-1 md:gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase hover:bg-primary/10 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden md:block">Dashboard</span>
        </Link>
      </div>
    </div>
  );
}