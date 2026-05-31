"use client";

export function CanvasBackground({ isLight }: { isLight: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 🌐 HYPER-GRID */}
      <div 
        className="absolute inset-0 w-full h-full opacity-60"
        style={{
          backgroundImage: isLight 
            ? 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)' 
            : 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      ></div>
      
      {/* 🟢 AMBIENT PRIMARY GLOW (Breathing Effect) */}
      <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-[150px] rounded-[100%] pointer-events-none transition-all duration-1000 animate-pulse
        ${isLight ? 'bg-primary/10 mix-blend-multiply' : 'bg-primary/20 mix-blend-screen'}`}></div>
        
      {/* 🔵 SECONDARY SUBTLE GLOW */}
      <div className={`absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-50
        ${isLight ? 'bg-blue-400/10 mix-blend-multiply' : 'bg-blue-500/10 mix-blend-screen'}`}></div>
    </div>
  );
}