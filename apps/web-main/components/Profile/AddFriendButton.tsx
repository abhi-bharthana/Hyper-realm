"use client";

import { useState } from "react";
import { api, API_URLS } from "@/lib/api"; 
import { UserPlus, Loader2, Check, AlertCircle } from "lucide-react";

export function AddFriendButton({ targetHid }: { targetHid: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");

  const handleAddFriend = async () => {
    // 🛡️ SAFETY CHECK: Ensure targetHid exists
    if (!targetHid) {
      console.error("Critical: targetHid is missing or undefined in props!");
      setError("System Error: ID missing");
      return;
    }

    console.log(`📡 Transmitting Friend Request to: [${targetHid}]`);
    setStatus("loading");
    setError("");

    try {
      await api.post(`${API_URLS.HUB}/users/requests/send`, { 
        target_hid: targetHid 
      });
      setStatus("sent");
      console.log("✅ Request successfully registered in Matrix.");
    } catch (err: any) {
      console.error("❌ Backend Error Details:", err);
      // Agar "Invalid target" aata hai toh user friendly message dikhao
      if (err.message.includes("Invalid target")) {
        setError("Cannot add yourself");
      } else {
        setError("Transmission Failed");
      }
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button 
        onClick={handleAddFriend}
        disabled={status !== "idle" || !!error}
        className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${
          status === "sent" 
            ? "bg-green-500/10 text-green-500 border border-green-500/20" 
            : error
            ? "bg-destructive/10 text-destructive border border-destructive/20 cursor-not-allowed"
            : "bg-primary text-black hover:scale-105 active:scale-95"
        }`}
      >
        {error ? (
          <><AlertCircle className="w-4 h-4" /> {error}</>
        ) : status === "idle" ? (
          <><UserPlus className="w-4 h-4" /> Send Request</>
        ) : status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Transmitting...</>
        ) : (
          <><Check className="w-4 h-4" /> Request Sent</>
        )}
      </button>
    </div>
  );
}