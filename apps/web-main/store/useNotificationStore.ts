import { create } from 'zustand';
import React from 'react';

export interface HyperNotification {
  id: string;
  title: string;
  message: string;
  icon?: string | React.ReactNode;
  appName?: string;
  isToast?: boolean; // 👈 Track karega ki screen pe dikhana hai ya nahi
}

interface NotificationState {
  notifications: HyperNotification[];
  notify: (notification: Omit<HyperNotification, 'id' | 'isToast'>) => void;
  hideToast: (id: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  notify: (notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    set((state) => ({
      // Nayi notif ko isToast: true ke sath add karo
      notifications: [{ ...notification, id, isToast: true }, ...state.notifications]
    }));

    // 5 second baad sirf toast hide karo, delete mat karo
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, isToast: false } : n
        )
      }));
    }, 5000);
  },

  hideToast: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => 
        n.id === id ? { ...n, isToast: false } : n
      )
    }));
  },

  dismiss: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  }
}));