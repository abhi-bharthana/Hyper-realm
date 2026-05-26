// apps/web-main/app/dashboard/profile/page.tsx
"use client";

import { use } from "react";
import { ProfileSection } from "@/components/Profile/ProfileSection";
import { jwtDecode } from "jwt-decode";

export default function ProfileRoutePage({ searchParams }: { searchParams: Promise<{ hid?: string }> }) {
  // 🎯 NEXT.JS 16 FIX: Promise params ko client-side par cleanly unwrap kiya
  const resolvedSearchParams = use(searchParams);
  const targetHid = resolvedSearchParams.hid || "";

  // Owner authentication context mapping
  let isOwner = false;
  const token = typeof window !== "undefined" ? localStorage.getItem("hyper_id_token") : null;
  
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const myHid = decoded.hid || decoded.sub || "";
      isOwner = !targetHid || targetHid === myHid;
    } catch (e) {
      console.error("Failed to extract owner status:", e);
    }
  }

  return (
    <div className="pb-12">
      <ProfileSection userId={targetHid} isOwner={isOwner} />
    </div>
  );
}