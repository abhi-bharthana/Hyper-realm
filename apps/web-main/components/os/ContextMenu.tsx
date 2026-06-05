'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🚀 NAYA IMPORT: 'Layers' icon add kiya widgets ke liye
import { FolderPlus, RefreshCw, Image as ImageIcon, Settings, LayoutGrid, Layers } from 'lucide-react'; 
import { useOSStore } from '@/store/useOSStore';
// 🚀 NAYA IMPORT: Widget Store ko menu se connect karne ke liye
import { useWidgetStore } from '@/store/useWidgetStore'; 

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, isOpen, onClose }) => {
  const { openApp } = useOSStore();
  
  // 🚀 NAYA: Edit mode toggle function pull kar liya
  const { setEditMode } = useWidgetStore();

  // Screen click pe menu close karne ka logic
  useEffect(() => {
    const handleClick = () => {
      if (isOpen) onClose();
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);

  // Menu items array (Easy to manage)
  const menuItems = [
    { label: 'New Folder', icon: FolderPlus, action: () => console.log('New Folder Created'), divider: true },
    
    // 🔮 THE WIDGET TRIGGER
    { label: 'Edit Widgets', icon: Layers, action: () => setEditMode(true) }, 
    
    { label: 'Change Wallpaper', icon: ImageIcon, action: () => console.log('Wallpaper settings') },
    { label: 'Auto Arrange', icon: LayoutGrid, action: () => console.log('Arranging icons'), divider: true },
    { label: 'Refresh', icon: RefreshCw, action: () => window.location.reload() },
    { label: 'System Settings', icon: Settings, action: () => openApp('settings', 'Settings') },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, transformOrigin: 'top left' }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ top: y, left: x }}
          className="fixed z-[9999] w-56 p-1.5 rounded-2xl backdrop-blur-3xl bg-black/40 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          onContextMenu={(e) => e.preventDefault()} // Menu ke upar right-click disable
        >
          {menuItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors group"
              >
                <item.icon size={16} className="text-white/50 group-hover:text-white transition-colors" />
                {item.label}
              </button>
              
              {/* Divider Line */}
              {item.divider && <div className="h-px w-full bg-white/10 my-1 rounded-full" />}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};