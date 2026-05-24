"use client";

import { useState, useEffect } from "react";
import { api, API_URLS } from "@/lib/api"; 
import { jwtDecode } from "jwt-decode"; // 🚀 Imported to identify the current session

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<any>(null);
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
            // JWT token se logged-in user ka HID nikal rahe hain
            myHid = decoded.hid || decoded.sub || ""; 
          } catch (jwtErr) {
            console.error("⚠️ Token decoding failed in profile hook:", jwtErr);
          }
        }

        // 🛡️ SMART ROUTING DETECTOR
        // Agar userId blank hai ya khud ke HID ke barabar hai -> Own Profile
        const isOwnProfile = !userId || userId === myHid;

        // Endpoint routing condition logic
        const endpoint = isOwnProfile
          ? `${API_URLS.HUB}/profile`                      // 🎯 Hits GetProfileHandler (Auto-creates if missing)
          : `${API_URLS.HUB}/profile/view?hid=${userId}`;   // 🎯 Hits GetOtherProfileHandler

        // Main Profile HTTP request Execution
        const profileData = await api.get(endpoint);

        // Friends count fetch engine mapping
        let fCount = 0;
        const targetQueryHID = userId || myHid;
        
        if (targetQueryHID) {
          try {
            const friendsData = await api.get(`${API_URLS.HUB}/friends?hid=${targetQueryHID}`);
            fCount = friendsData.friends?.length || 0;
          } catch (err) {
            console.warn("⚠️ Could not fetch friends count:", err);
          }
        }

        setProfile(profileData);
        setFriendsCount(fCount);
        
        // Connection status determination
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