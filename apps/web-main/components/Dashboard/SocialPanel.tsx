"use client";

import { useState } from "react";
import { Search, UserPlus, Check, Loader2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SocialPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  // Search User Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("hyper_id_token");
      const res = await fetch(`http://localhost:8081/api/v1/users/search?q=${searchQuery}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error("User search failed");
    } finally {
      setLoading(false);
    }
  };

  // Add Friend Logic
  const addFriend = async (userId: string) => {
    try {
      const token = localStorage.getItem("hyper_id_token");
      const res = await fetch(`http://localhost:8081/api/v1/friends/request`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ to_user_id: userId })
      });
      if (res.ok) setSentRequests([...sentRequests, userId]);
    } catch (err) {
      console.error("Friend request failed");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Neural Connections</span>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by HID or Nickname..."
          className="w-full bg-foreground/5 border border-border rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {/* Results List */}
      <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <AnimatePresence mode="popLayout">
          {users.map((user) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-4 rounded-[2rem] bg-foreground/[0.03] border border-border/50 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                  {user.nickname[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[120px]">{user.nickname}</p>
                  <p className="text-[9px] font-mono opacity-40 uppercase">HID: {user.hid.split('-')[0]}</p>
                </div>
              </div>

              <button 
                onClick={() => addFriend(user.id)}
                disabled={sentRequests.includes(user.id)}
                className={`p-2.5 rounded-xl transition-all ${
                  sentRequests.includes(user.id) 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-primary text-background hover:scale-110 active:scale-95'
                }`}
              >
                {sentRequests.includes(user.id) ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {users.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-10 opacity-20 italic">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-[10px] uppercase tracking-widest">No nodes found</p>
          </div>
        )}
      </div>
    </div>
  );
}