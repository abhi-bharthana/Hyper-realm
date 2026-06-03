import { useState, useEffect } from 'react';

interface GenerationState {
  status: 'idle' | 'processing' | 'ready' | 'failed';
  generatedUrl: string | null;
}

export function useGenerationQueue(assetId: string | null) {
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    generatedUrl: null,
  });

  useEffect(() => {
    if (!assetId) {
      setState({ status: 'idle', generatedUrl: null });
      return;
    }

    setState((prev) => ({ ...prev, status: 'processing' }));

    // Tera Go Backend WebSocket URL (Hyper-Hub ya SMS-Service jo bhi tune define kiya ho)
    const token = localStorage.getItem('hyper_token') || '';
    const ws = new WebSocket(`ws://localhost:8081/api/v1/ws?token=${token}`);

    ws.onopen = () => {
      console.log(`🔌 Subscribed to real-time events for Asset: ${assetId}`);
      // Send a message to register interest in this specific asset
      ws.send(JSON.stringify({ action: "subscribe", topic: `asset.${assetId}` }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        // Match the Kafka event coming from the Python Worker
        if (payload.asset_id === assetId && payload.event_type === '3d.generation.preview_ready') {
          console.log("🎉 Model Generated!", payload.preview_glb_url);
          setState({
            status: 'ready',
            generatedUrl: payload.preview_glb_url,
          });
          ws.close(); // Clean up connection once task is done
        }

        if (payload.asset_id === assetId && payload.event_type === '3d.generation.failed') {
          setState({ status: 'failed', generatedUrl: null });
          ws.close();
        }
      } catch (error) {
        console.error("WebSocket message parse error", error);
      }
    };

    ws.onerror = () => {
      console.error("WebSocket connection error");
      // Fallback polling logic lagani ho toh yahan aayegi
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [assetId]);

  return state;
}