// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { AppWrapper } from "@/components/AppWrapper";
import { MagicPill } from "@/components/MagicPill";
import { SettingsPanel } from "@/components/SettingsPanel"; // <-- Naya Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hyper-Realm | Verdant Node",
  description: "Universal Identity & Ecosystem Dashboard",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* DIYA DHAYAN: 'bg-black' ko hata kar 'bg-background' kar diya hai 
        taaki globals.css ke variables kaam kar sakein 
      */}
      <body className={`${inter.className} bg-background transition-colors duration-500 overflow-x-hidden antialiased`}>
        <AppWrapper>
          <FloatingNavbar />
          <SettingsPanel />
          <MagicPill /> 
          <main className="pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
            {children}
          </main>
        </AppWrapper>
      </body>
    </html>
  );
}