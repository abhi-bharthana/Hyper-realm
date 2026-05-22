"use client";
import { useEffect, useState } from "react";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(time);
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = time.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-baseline gap-1">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-foreground leading-none">
          {hours}:{minutes}
        </h2>
        <span className="text-2xl md:text-4xl font-bold text-primary italic opacity-80">
          {seconds}
        </span>
      </div>
      <div className="mt-4 flex flex-col">
        <span className="text-[10px] font-mono uppercase tracking-[0.6em] text-primary">
          {dayName}
        </span>
        <span className="text-sm font-medium opacity-40 uppercase tracking-widest">
          {fullDate}
        </span>
      </div>
    </div>
  );
}