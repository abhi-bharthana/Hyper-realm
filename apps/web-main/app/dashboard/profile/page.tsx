"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Loader2, Edit3, Save, X, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nickname: "", bio: "" });

  const fetchProfile = async () => {
    const token = localStorage.getItem("hyper_id_token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch("http://localhost:8081/api/v1/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({ nickname: data.nickname, bio: data.bio });
      } else if (res.status === 401) {
        // Token bad/expired ho toh login par wapas phenko
        localStorage.removeItem("hyper_id_token");
        router.push("/login");
      }
    } catch (err) { 
      console.error("Profile Sync Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("hyper_id_token");
    try {
      const res = await fetch("http://localhost:8081/api/v1/profile/update", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsEditing(false);
        fetchProfile(); // Fresh data load karo update ke baad
      }
    } catch (err) { 
      console.error("Profile Update Failure:", err); 
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Syncing Hyper-Hub...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[3.5rem] border border-border bg-card/40 backdrop-blur-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-36 h-36 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.2)]">
             <User className="w-16 h-16 text-background" />
          </div>

          <div className="text-center md:text-left flex-grow">
            {!isEditing ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                    {profile?.nickname || "New_Commander"}
                  </h1>
                  <span className="px-4 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em] w-fit mx-auto md:mx-0">
                    Rank: {profile?.rank || "Agent"}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground font-medium mb-6 max-w-xl">
                  {profile?.bio || "Welcome to the Hyper-Realm."}
                </p>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-background font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all mx-auto md:mx-0">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </>
            ) : (
              <div className="space-y-4 max-w-md mx-auto md:mx-0">
                <input 
                  className="w-full bg-background/50 border border-border p-4 rounded-2xl text-2xl font-bold italic text-foreground"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  placeholder="Set Nickname"
                />
                <textarea 
                  className="w-full bg-background/50 border border-border p-4 rounded-2xl h-24 text-foreground"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Describe your role in the Realm..."
                />
                <div className="flex gap-2 justify-center md:justify-start">
                  <button onClick={handleUpdate} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-green-600">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground/10 text-foreground font-black uppercase text-[10px] tracking-widest hover:bg-foreground/20">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Zap className="absolute -right-10 -bottom-10 w-64 h-64 opacity-[0.03] rotate-12 pointer-events-none" />
      </motion.div>
    </div>
  );
}