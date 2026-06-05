'use client';

import { useState } from 'react';

export type SnapType = 
  | 'left' | 'right' | 'top' 
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' 
  | 'third-left' | 'third-center' | 'third-right' 
  | null;

export const useWindowDrag = (OS_TOP_BAR_HEIGHT: number) => {
  const [snapPreview, setSnapPreview] = useState<SnapType>(null);

  const handleDrag = (e: any, info: any) => {
    const px = info.point.x; 
    const py = info.point.y;
    const padX = 20; 
    const padY = 20;
    const screenW = window.innerWidth; 
    const screenH = window.innerHeight;

    if (px < padX && py < padY + OS_TOP_BAR_HEIGHT) setSnapPreview('top-left');
    else if (px > screenW - padX && py < padY + OS_TOP_BAR_HEIGHT) setSnapPreview('top-right');
    else if (px < padX && py > screenH - padY) setSnapPreview('bottom-left');
    else if (px > screenW - padX && py > screenH - padY) setSnapPreview('bottom-right');
    else if (px < padX) setSnapPreview('left');
    else if (px > screenW - padX) setSnapPreview('right');
    else if (py < padY + OS_TOP_BAR_HEIGHT) setSnapPreview('top');
    else setSnapPreview(null);
  };

  return { snapPreview, setSnapPreview, handleDrag };
};