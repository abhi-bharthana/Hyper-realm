"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, User } from "lucide-react";
import { api, API_URLS } from "@/lib/api";

const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";   
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png"; 

export function RequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.get(`${API_URLS.HUB}/users/requests`);
        setRequests(data || []);
      } catch (e) {
        console.error("Failed to fetch requests", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (hid: string) => {
    setRequests((prev) => prev.filter((r) => r.hid !== hid));
    try {
      await api.post(`${API_URLS.HUB}/users/requests/accept`, { target_hid: hid });
    } catch (e) {
      console.error("Failed to accept request", e);
    }
  };

  const handleDecline = async (hid: string) => {
    setRequests((prev) => prev.filter((r) => r.hid !== hid));
    try {
      await api.post(`${API_URLS.HUB}/users/requests/decline`, { target_hid: hid });
    } catch (e) {
      console.error("Failed to decline request", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Syncing Requests...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 opacity-50">
        <p className="text-xs uppercase font-black tracking-widest">No Pending Requests</p>
      </div>
    );
  }

  return (
    <>
      {requests.map((req, idx) => {
        let displayAvatar = req.avatar_url || (req.gender === 'female' ? IMAGE_2_FEMALE_DEFAULT : IMAGE_1_MALE_DEFAULT);

        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }}
            key={req.hid} 
            className="p-4 rounded-[1.5rem] border border-primary/20 bg-primary/5 backdrop-blur-sm flex flex-col gap-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{req.nickname}</h4>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{req.role} • {req.time || 'New'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => handleAccept(req.hid)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-black font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
              >
                <Check className="w-3 h-3" /> Accept
              </button>
              <button 
                onClick={() => handleDecline(req.hid)}
                className="w-12 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}