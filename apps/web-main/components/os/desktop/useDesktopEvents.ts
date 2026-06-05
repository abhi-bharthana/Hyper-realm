'use client';

import { useState, useEffect } from 'react';
import { useWidgetStore } from '@/store/useWidgetStore';

export const useDesktopEvents = () => {
  const { addWidget } = useWidgetStore();
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [isLauncherOpen, setIsLauncherOpen] = useState(false); // 🚀 State moved here!

  // 🚀 GLOBAL KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsLauncherOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 🖱️ CONTEXT MENU HANDLERS
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menuWidth = 224; const menuHeight = 200;
    let x = e.pageX; let y = e.pageY;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

    setContextMenu({ show: true, x, y });
  };

  const closeContextMenu = () => {
    if (contextMenu.show) setContextMenu({ show: false, x: 0, y: 0 });
  };

  // 🧩 DRAG & DROP HANDLERS
  const handleDragOver = (e: React.DragEvent) => e.preventDefault(); 
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData('application/hyper-widget');
    if (widgetId) addWidget(widgetId, e.clientX, e.clientY);
  };

  return { 
    contextMenu, setContextMenu, handleContextMenu, closeContextMenu, 
    handleDragOver, handleDrop, isLauncherOpen, setIsLauncherOpen 
  };
};