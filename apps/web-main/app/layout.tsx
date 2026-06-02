import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 👇 Apna naya wrapper import kiya
import { LayoutWrapper } from "@/components/LayoutWrapper"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hyper-Realm | Verdant Node",
  description: "Universal Identity & Ecosystem Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background transition-colors duration-500 overflow-x-hidden antialiased`}>
        
        {/* Saari power is wrapper ko de di. Ye decide karega ki OS dikhana hai ya Website */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>

      </body>
    </html>
  );
}