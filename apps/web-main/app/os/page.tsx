'use client';

import React, { useState, useEffect } from 'react';
import { BootScreen } from '@/components/os/BootScreen';
import { Desktop } from '@/components/os/Desktop';

export default function HyperOSPage() {
  const [isBooted, setIsBooted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 🧠 Check kar rahe hain ki kya OS is session mein pehle boot hua tha?
    const hasBootedBefore = sessionStorage.getItem('hyper_os_booted') === 'true';
    
    if (hasBootedBefore) {
      setIsBooted(true); // Agar pehle se boot hai, toh direct Desktop dikhao
    }
    
    setIsMounted(true);
  }, []);

  // 🚀 Boot complete hone pe sessionStorage mein flag save kar do
  const handleBootComplete = () => {
    sessionStorage.setItem('hyper_os_booted', 'true');
    setIsBooted(true);
  };

  // Hydration mismatch avoid karne ke liye blank screen until mounted
  if (!isMounted) return <div className="w-screen h-screen bg-black" />;

  return (
    <main className="w-screen h-screen overflow-hidden bg-black text-white selection:bg-[#8d6bff]/30">
      {!isBooted ? (
        <BootScreen onBootComplete={handleBootComplete} />
      ) : (
        <Desktop />
      )}
    </main>
  );
}