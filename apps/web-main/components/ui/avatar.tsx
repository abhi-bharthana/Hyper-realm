// components/ui/avatar.tsx
"use client";

import React, { useState } from "react";

// Main wrapper
export function Avatar({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
}

// Image component (Agar image load na ho, toh ye hide ho jayega aur Fallback dikhega)
export function AvatarImage({ src, alt, className = "" }: { src?: string; alt?: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return null; // Error aane par null return karega taaki fallback render ho

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || "Avatar"}
      onError={() => setHasError(true)}
      className={`aspect-square h-full w-full object-cover ${className}`}
    />
  );
}

// Fallback component (Initials dikhane ke liye)
export function AvatarFallback({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-zinc-100 font-medium ${className}`}>
      {children}
    </div>
  );
}