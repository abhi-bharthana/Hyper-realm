// filepath: apps/web-main/components/LayoutWrapper.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { FloatingNavbar } from "@/components/Navbar/FloatingNavbar";
import { AppWrapper } from "@/components/AppWrapper";
import { MagicPill } from "@/components/MagicPill/MagicPill";
import { SettingsPanel } from "@/components/Settings/SettingsPanel";
import { DiscoverPanel } from "@/components/Discover/DiscoverPanel";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isOS = pathname?.startsWith('/os');

  if (isOS) {
    // 🚀 OS MODE: No Navbar, No Padding, No Scroll
    return (
      <div className="w-screen h-screen overflow-hidden bg-black text-white">
        {children}
      </div>
    );
  }

  // 🌐 DASHBOARD MODE: Purana UI intact
  return (
    <AppWrapper>
      <FloatingNavbar />
      <SettingsPanel />
      <DiscoverPanel />
      <MagicPill /> 
      
      {/* Yahan pt-28 aur max-w-7xl sirf dashboard ke liye hai. 
        Jab tum /os route pe hoge, to ye class apply nahi hogi!
      */}
      <main className="pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        {children}
      </main>
    </AppWrapper>
  );
};