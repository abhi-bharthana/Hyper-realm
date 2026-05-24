// components/Profile/ProfileSection.tsx
"use client";

import { useState, useEffect } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { AddFriendButton } from "./AddFriendButton";
import { FollowButton } from "./FollowButton";
import { useProfile } from "@/hooks/useProfile";
import { api, API_URLS } from "@/lib/api";
import { Loader2, Edit3, Check, X } from "lucide-react";

export function ProfileSection({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const { profile, friendsCount, loading, connectionStatus } = useProfile(userId);
  const [activeTab, setActiveTab] = useState("Post");
  
  // Edit State Triggers
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ nickname: "", bio: "" });

  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="bg-card rounded-[2.5rem] p-10 flex justify-center items-center min-h-[300px] border border-border shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) return null;

  const handleProfileSave = async () => {
    if (!formData.nickname.trim()) return;
    setIsSaving(true);
    try {
      await api.post(`${API_URLS.HUB}/profile/update`, {
        nickname: formData.nickname,
        bio: formData.bio,
      });

      localStorage.setItem("hyper_username", formData.nickname);
      setIsEditing(false);
      window.location.reload(); // Hard update layout content refresh
    } catch (err) {
      console.error("Operation Failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = ["Post", "Reels", "Music"];

  // Create action buttons layout for user/guest contexts dynamically
  const renderActionButtons = () => {
    if (!isOwner) {
      return (
        <div className="flex gap-2">
          {(connectionStatus === "none" || !connectionStatus) && (
            <AddFriendButton targetHid={userId} />
          )}
          {connectionStatus === "pending" && (
            <button disabled className="px-6 py-2.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 font-bold text-xs uppercase tracking-widest cursor-not-allowed transition-all">
              Pending Request
            </button>
          )}
          {connectionStatus === "accepted" && (
            <button disabled className="px-6 py-2.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 font-bold text-xs uppercase tracking-widest cursor-not-allowed transition-all">
              Already Friends
            </button>
          )}
          <FollowButton receiverId={userId} />
        </div>
      );
    }

    // Is Owner -> Render Edit/Save action toggles smoothly
    return !isEditing ? (
      <button 
        onClick={() => setIsEditing(true)}
        className="px-5 py-2 rounded-full bg-muted border border-border hover:bg-primary hover:text-black font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all"
      >
        <Edit3 className="w-3.5 h-3.5" /> Edit Profile
      </button>
    ) : (
      <div className="flex items-center gap-1.5">
        <button 
          onClick={handleProfileSave}
          disabled={isSaving}
          className="p-2 rounded-full bg-primary text-black font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => {
            setIsEditing(false);
            setFormData({ nickname: profile.nickname || "", bio: profile.bio || "" });
          }}
          className="p-2 rounded-full border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm max-w-5xl mx-auto transition-colors duration-300">
      
      <ProfileHeader 
        user={profile} 
        friendsCount={friendsCount} 
        postsCount={profile.posts || 0}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        actionButton={renderActionButtons()}
      />

      {/* Tabs Section */}
      <div className="mt-12 bg-muted p-1.5 rounded-2xl flex items-center gap-2 max-w-3xl mx-auto transition-colors duration-300">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-10 min-h-[200px]">
        {activeTab === "Post" && (
          <div className="flex gap-6 overflow-x-auto pb-6">
             <div className="w-[340px] h-[220px] rounded-[2rem] bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-7 flex flex-col justify-between shrink-0 relative">
               <div>
                 <h3 className="text-foreground font-semibold text-xl">Become a UX Designer</h3>
                 <p className="text-muted-foreground text-sm mt-1">Learn the skills & get the Job</p>
                 <p className="text-foreground font-bold tracking-widest mt-4">/ / / / /</p>
               </div>
               <div className="flex items-end justify-between">
                 <div className="flex items-baseline gap-1">
                   <span className="text-[2.5rem] leading-none font-bold text-foreground">4.85</span>
                   <span className="text-muted-foreground text-sm font-medium">★ ratings</span>
                 </div>
                 <span className="text-sm font-medium text-foreground/80">48h</span>
               </div>
               <div className="absolute -right-3 top-8 bottom-8 w-4 bg-foreground rounded-r-xl -z-10" />
             </div>
             
             <div className="w-[340px] h-[220px] rounded-[2rem] bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-7 flex flex-col justify-between shrink-0 relative">
               <div>
                 <h3 className="text-foreground font-semibold text-xl">Master Agentic AI</h3>
                 <p className="text-muted-foreground text-sm mt-1">CrewAI & AutoGen Implementation</p>
                 <p className="text-foreground font-bold tracking-widest mt-4">/ / / / /</p>
               </div>
               <div className="flex items-end justify-between">
                 <div className="flex items-baseline gap-1">
                   <span className="text-[2.5rem] leading-none font-bold text-foreground">5.0</span>
                   <span className="text-muted-foreground text-sm font-medium">★ ratings</span>
                 </div>
                 <span className="text-sm font-medium text-foreground/80">24h</span>
               </div>
               <div className="absolute -right-3 top-8 bottom-8 w-4 bg-foreground rounded-r-xl -z-10" />
             </div>
          </div>
        )}
        
        {activeTab === "Reels" && <p className="text-center text-muted-foreground mt-16 font-medium">No reels uploaded yet.</p>}
        {activeTab === "Music" && <p className="text-center text-muted-foreground mt-16 font-medium">No audio tracks found.</p>}
      </div>
    </div>
  );
}