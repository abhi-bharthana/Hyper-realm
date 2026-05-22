"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, User, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    nickname: "",
  });

  // Page load hote hi local storage se token uthao
  useEffect(() => {
    const savedToken = localStorage.getItem("hyper_id_token");
    if (!savedToken) {
      router.push("/login"); // Token nahi hai toh wapas login pe fenko
    } else {
      setToken(savedToken);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 👈 YEH RAHI TERI MIDDLEWARE KI CHABI
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to initialize operator profile.");
      }

      const data = await res.json();

      // Naya 'active' token mila! Purane wale ko overwrite karo
      localStorage.setItem("hyper_id_token", data.token);

      // Access Granted! Seedha matrix ke andar...
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding Error:", err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-foreground relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="p-8 max-w-md w-full rounded-[2.5rem] border border-border bg-card/30 backdrop-blur-3xl relative z-10 space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-2 border border-primary/50">
            <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Identity Setup</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Register your Neural Handle</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Operator Handle (Username) *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                required
                pattern="^[a-zA-Z0-9._-]+$"
                placeholder="e.g. Neo_01"
                className="w-full bg-background/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">First Name</label>
              <input 
                type="text" 
                className="w-full bg-background/50 border border-border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Last Name</label>
              <input 
                type="text" 
                className="w-full bg-background/50 border border-border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4 bg-primary text-background font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> MINTING IDENTITY...</>
            ) : (
              <><Zap className="w-5 h-5" /> ESTABLISH CONNECTION</>
            )}
          </button>
        </form>
      </motion.div>
      
      {/* Background Matrix glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}