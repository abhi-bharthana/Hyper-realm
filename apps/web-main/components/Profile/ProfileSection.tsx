'use client';

import { useState, useEffect } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { AddFriendButton } from "./AddFriendButton";
import { FollowButton } from "./FollowButton";
import { useProfile } from "@/hooks/useProfile";
import { api, API_URLS } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore"; // 🚀 BRIDGE IMPORT
import { Loader2, Edit3, Check, X } from "lucide-react";

export function ProfileSection({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const { profile, friendsCount, loading, connectionStatus } = useProfile(userId);
  const [activeTab, setActiveTab] = useState("Post");
  
  // 🚀 BRIDGE HOOK
  const { updateProfile } = useUserStore();

  // Edit State Triggers
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ nickname: "", bio: "", gender: "" });

  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || "",
        bio: profile.bio || "",
        gender: profile.gender || "", 
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
      // 1. Social Backend (Hub) update
      await api.post(`${API_URLS.HUB}/profile/update`, {
        nickname: formData.nickname,
        bio: formData.bio,
        gender: formData.gender, 
      });

      // 2. 🚀 THE BRIDGE: OS Store ko update karo (Gender ke sath)
      if (isOwner) {
        updateProfile({
            nickname: formData.nickname,
            name: formData.nickname, // Mapping nickname to name
            bio: formData.bio,
            gender: formData.gender
        });
      }

      localStorage.setItem("hyper_username", formData.nickname);
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      console.error("Operation Failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = ["Post", "Reels", "Music"];

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
            setFormData({ nickname: profile.nickname || "", bio: profile.bio || "", gender: profile.gender || "" });
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

      <div className="mt-10 min-h-[200px]">
        {activeTab === "Post" && (
          <div className="flex gap-6 overflow-x-auto pb-6">
             {/* ... content ... */}
          </div>
        )}
      </div>
    </div>
  );
}