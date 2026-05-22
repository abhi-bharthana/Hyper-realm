"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Zap, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function LoginContent() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsSyncing(true);
    setError("");

    try {
      // 1. Google raw credential token ko Hyper-ID (8080) ke saath exchange karo
      const res = await fetch("http://localhost:8080/api/v1/auth/google", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Google-Token": credentialResponse.credential 
        },
      });

      if (!res.ok) {
        // Agar fail hota hai toh backend ka exact error text console mein dikhega
        const errorText = await res.text();
        console.error("Backend Error Details:", errorText);
        throw new Error("Invalid Neural Link Token from Identity Provider");
      }

      const data = await res.json();

      // 2. Hyper-ID ka signed RSA JWT save karo
      localStorage.setItem("hyper_id_token", data.token);

      // 3. SMART ROUTING: Backend status ke hisaab se redirect karo
      if (data.status === "pending_onboarding") {
        router.push("/onboarding"); // Naya user -> Username setup page
      } else {
        router.push("/dashboard"); // Purana user -> Seedha matrix ke andar
      }
      
    } catch (err: any) {
      console.error("Auth Exchange Error:", err);
      setError(err.message || "Neural Link connection refused.");
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-foreground relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 max-w-md w-full rounded-[2.5rem] border border-border bg-card/30 backdrop-blur-3xl text-center relative z-10 space-y-6"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)]">
          <Zap className="w-8 h-8 text-background animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Initialize Neural Link</h1>
          <p className="text-sm text-muted-foreground">Authenticate to sync with the Hyper-Realm ecosystem.</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        <div className="flex justify-center pt-4">
          {isSyncing ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Syncing Matrix...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Authentication Failed")}
              theme="filled_black"
              shape="pill"
            />
          )}
        </div>
      </motion.div>
      <Zap className="absolute -right-20 -bottom-20 w-96 h-96 opacity-[0.02] rotate-45 pointer-events-none" />
    </div>
  );
}

// Apni Google Client ID yahan replace kar lena config se
export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="306788201596-phllg7davd9ib2vkm1adrqrrv8r6ogoi.apps.googleusercontent.com">
      <LoginContent />
    </GoogleOAuthProvider>
  );
}