import React from 'react';
import Link from 'next/link';
import { Layers, Wrench, Beaker, MonitorPlay, Store } from 'lucide-react'; // Adjust icons as per your library

export default function AppsHubPage() {
  const sections = [
    { title: "Services", icon: <Wrench size={24} />, desc: "Core Hyper-Realm services & logistics", href: "/services" },
    { title: "Labs", icon: <Beaker size={24} />, desc: "Neural Canvas, 3D Lab & AI Tools", href: "/3d-lab" },
    { title: "Studios", icon: <MonitorPlay size={24} />, desc: "Realm Studio & Content Creation", href: "/os/apps/realm-studio" },
    { title: "Stores", icon: <Store size={24} />, desc: "Marketplace & Asset Grid", href: "/store" },
  ];

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Hyper-Realm Hub</h1>
        <p className="text-muted-foreground mb-10">Access all your environments in one place.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, index) => (
            <Link 
              key={index} 
              href={section.href}
              className="p-6 border rounded-xl hover:shadow-lg hover:border-primary transition-all group bg-card"
            >
              <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}