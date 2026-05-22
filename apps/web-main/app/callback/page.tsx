// app/callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

// Token catch karne wala component
function TokenCatcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL se 'token' nikal rahe hain (Go backend ne yahi bheja hai)
    const token = searchParams.get("token");

    if (token) {
      // Token mil gaya! Ise LocalStorage mein save kar de
      localStorage.setItem("hyper_id_token", token);
      
      // Token save hone ke baad seedha Homepage (ya Dashboard) pe bhej de
      router.push("/"); 
    } else {
      // Agar token nahi mila toh wapas login pe bhej do
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 border-t-2 border-lime-400 rounded-full animate-spin"></div>
        <Zap className="w-6 h-6 text-lime-400 animate-pulse" />
      </div>
      <h2 className="text-xl font-bold tracking-widest text-white">ESTABLISHING NEURAL LINK...</h2>
      <p className="text-gray-400 text-sm">Syncing your identity with Hyper-Realm</p>
    </div>
  );
}

// Main Page Component
export default function CallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black transition-colors duration-700">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-lime-400" />}>
        <TokenCatcher />
      </Suspense>
    </div>
  );
}