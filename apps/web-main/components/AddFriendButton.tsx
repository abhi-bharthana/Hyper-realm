"use client";

import { useState } from "react";
import { api, API_URLS } from "@/lib/api"; // <-- Naya Centralized Client Import
import { UserPlus, Loader2, Check } from "lucide-react";

export function AddFriendButton({ targetHid }: { targetHid: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");

  const handleAddFriend = async () => {
    setStatus("loading");
    setError("");

    try {
      // 1. ASLI BACKEND CALL (api.ts apne aap token attach karega)
      // Note: Make sure ki aapka Go backend ye route handle karta ho
      await api.post(`${API_URLS.HUB}/users/requests/send`, { 
        target_hid: targetHid 
      });

      // -------------------------------------------------------------
      // 2. MOCK FALLBACK (Agar backend API abhi ready nahi hai, 
      // toh upar wali api.post line comment kardo aur neeche wala use karo)
      /*
      await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
      const mockSent = JSON.parse(localStorage.getItem("mock_sent_requests") || "[]");
      localStorage.setItem("mock_sent_requests", JSON.stringify([...mockSent, targetHid]));
      */
      // -------------------------------------------------------------

      setStatus("sent");
    } catch (err: any) {
      console.error("Backend Error Details:", err);
      // Agar error aata hai toh console mein exact reason dikhega
      setError(err.message || "Failed to send request");
      setStatus("idle");
    }
  };

  return (
    <button 
      onClick={handleAddFriend}
      disabled={status !== "idle"}
      className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${
        status === "sent" 
          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
          : "bg-primary text-black hover:scale-105 active:scale-95"
      }`}
    >
      {status === "idle" && (
        <>
          <UserPlus className="w-4 h-4" /> Send Request
        </>
      )}
      {status === "loading" && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Transmitting...
        </>
      )}
      {status === "sent" && (
        <>
          <Check className="w-4 h-4" /> Request Sent
        </>
      )}
    </button>
  );
}