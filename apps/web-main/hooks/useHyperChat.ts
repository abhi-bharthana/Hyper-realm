import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  from: string;
  msg: string;
  timestamp: string;
}

export const useHyperChat = (userId: string, token: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId || !token) return;

    // Go service URL (port 8002)
    const wsUrl = `ws://localhost:8002/ws/${userId}?token=${token}`;
    
    const connectWs = () => {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("✅ Connected to Hyper-Realm SMS Service");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const newMsg: ChatMessage = JSON.parse(event.data);
          setMessages((prev) => [...prev, newMsg]);
        } catch (error) {
          console.error("❌ Message Parse Error:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("⚠️ Disconnected from server. Reconnecting in 3s...");
        setIsConnected(false);
        // Auto-reconnect mechanism
        setTimeout(connectWs, 3000);
      };
    };

    connectWs();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId, token]);

  const sendMessage = (receiverId: string, content: string) => {
    if (ws.current && isConnected) {
      const payload = {
        receiver: receiverId,
        content: content,
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(payload));
    } else {
      console.error("🚫 Cannot send message: Not connected");
    }
  };

  return { messages, isConnected, sendMessage };
};