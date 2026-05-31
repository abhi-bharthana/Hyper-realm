"use client";

interface Props {
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  isLight: boolean;
}

export function AspectRatioControls({ aspectRatio, setAspectRatio, isLight }: Props) {
  const ratios = ['A4', '16:9', 'infinite'];

  return (
    <div className={`fixed bottom-8 right-8 flex gap-2 p-1.5 rounded-2xl backdrop-blur-xl border z-40 transition-all shadow-xl
      ${isLight ? 'bg-white/90 border-slate-200/50' : 'bg-black/60 border-white/10'}`}>
      {ratios.map((ratio) => (
        <button
          key={ratio}
          onClick={() => setAspectRatio(ratio)}
          className={`px-4 py-2 rounded-xl transition-all text-xs uppercase font-black tracking-widest outline-none
            ${aspectRatio === ratio 
              ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)] scale-95' 
              : `opacity-50 hover:opacity-100 ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}`}
        >
          {ratio}
        </button>
      ))}
    </div>
  );
}