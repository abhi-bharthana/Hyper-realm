"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { DigitalClock } from "@/components/Dashboard/DigitalClock";
import { NewsPanel } from "@/components/Dashboard/NewsPanel";
import { SocialPanel } from "@/components/Dashboard/SocialPanel";
import { useThemeStore } from "@/store/useThemeStore";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { showClock, showNews } = useThemeStore();
  const [username, setUsername] = useState("GUEST");

  useEffect(() => {
    const token = localStorage.getItem("hyper_id_token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      
      // 🚨 ONBOARDING GUARD: Agar status pending hai toh seedha onboarding pe bhejo
      if (decoded.status === "pending_onboarding") {
        router.push("/onboarding");
        return;
      }

      // Username set karo
      setUsername(decoded.username || "OPERATOR");
    } catch (error) {
      console.error("Auth Token Invalid:", error);
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[60vh] pb-10">
      
      {/* --- LEFT SECTION --- */}
      <div className="md:col-span-8 space-y-6">
        {showClock && (
          <motion.div className="p-10 rounded-[3rem] border border-border bg-card/40 backdrop-blur-xl">
            <DigitalClock />
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Neural Activity Graph */}
           <motion.div className="p-8 rounded-[2.5rem] border border-border bg-card/20 backdrop-blur-md">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Neural Activity</p>
              <div className="h-28 flex items-end gap-1.5">
                 {[40, 70, 45, 90, 65, 80, 50, 60, 85].map((h, i) => (
                   <div key={i} className="flex-1 bg-primary/20 rounded-t-lg h-[80%]" />
                 ))}
              </div>
           </motion.div>

           {/* Node Status Card */}
           <motion.div className="p-8 rounded-[2.5rem] border border-border bg-card/20 backdrop-blur-md flex flex-col justify-center">
              <h4 className="text-4xl font-black italic tracking-tighter text-foreground">NODE 01</h4>
              <p className="text-[10px] opacity-40 font-mono uppercase tracking-widest mt-1">Hello, {username}</p>
           </motion.div>
        </div>
      </div>

      {/* --- RIGHT SECTION --- */}
      <div className="md:col-span-4 space-y-6">
        {showNews && (
          <motion.div className="p-8 rounded-[3rem] border border-border bg-card/40 backdrop-blur-xl h-[450px] flex flex-col">
            <NewsPanel />
          </motion.div>
        )}

        <motion.div className="p-8 rounded-[3rem] border border-border bg-card/40 backdrop-blur-xl h-[450px] flex flex-col shadow-2xl shadow-primary/5">
          <SocialPanel />
        </motion.div>
      </div>
    </div>
  );
}