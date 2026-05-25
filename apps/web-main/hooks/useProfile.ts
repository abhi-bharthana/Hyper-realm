"use client";

import { useState, useEffect } from "react";
import { api, API_URLS } from "@/lib/api"; 
import { jwtDecode } from "jwt-decode"; 

// 🚀 NAYA: TypeScript Interface for Profile Data taaki frontend crash na ho aur suggestions milein
export interface UserProfileData {
  hid: string;
  nickname: string;
  bio: string;
  avatar_url: string;
  rank: string;
  trust_score: number;
  gender: string;               // <-- NAYA FIELD YAHAN ADD KIYA HAI
  created_at?: string;
  connection_status?: string;   // Sirf external profiles mein aata hai
}

export function useProfile(userId: string) {
  // 🚀 NAYA: State ko type-safe bana diya `any` hata kar
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>("none"); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean old states before fetching new data
    setProfile(null);
    setConnectionStatus("none");
    setLoading(true);

    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("hyper_id_token");
        let myHid = "";

        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            myHid = decoded.hid || decoded.sub || ""; 
          } catch (jwtErr) {
            console.error("⚠️ Token decoding failed in profile hook:", jwtErr);
          }
        }

        const isOwnProfile = !userId || userId === myHid;

        const endpoint = isOwnProfile
          ? `${API_URLS.HUB}/profile`                      
          : `${API_URLS.HUB}/profile/view?hid=${userId}`;   

        const profileData = await api.get(endpoint);

        let fCount = 0;
        const targetQueryHID = userId || myHid;
        
        if (targetQueryHID) {
          try {
            // 🔥 CRITICAL FIX: Changed from /friends to /users/friends to match new Golang backend logic & NGINX rules
            const friendsData = await api.get(`${API_URLS.HUB}/users/friends?hid=${targetQueryHID}`);
            fCount = friendsData.friends?.length || 0;
          } catch (err) {
            console.warn("⚠️ Could not fetch friends count:", err);
          }
        }

        setProfile(profileData);
        setFriendsCount(fCount);
        
        if (isOwnProfile) {
          setConnectionStatus("self");
        } else {
          setConnectionStatus(profileData.connection_status || "none");
        }
        
        console.log(`✅ Profile Sync Complete via [${isOwnProfile ? "OWN CORE" : "EXTERNAL NODE"}]`);
      } catch (error) {
        console.error("❌ Profile Hook Sync Critical Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]); 

  return { profile, friendsCount, connectionStatus, loading };
}