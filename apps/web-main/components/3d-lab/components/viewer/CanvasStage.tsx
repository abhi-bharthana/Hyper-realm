import { Canvas } from '@react-three/fiber';
import { Stage, OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import ModelLoader from './ModelLoader';

interface CanvasStageProps {
  modelUrl: string | null;
}

export default function CanvasStage({ modelUrl }: CanvasStageProps) {
  if (!modelUrl) return null;

  return (
    // dpr (Device Pixel Ratio) responsive resolution handle karta hai
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 5], fov: 45 }}>
      {/* Suspense fallback tab tak dikhega jab tak GLB network se download ho raha hai */}
      <Suspense fallback={null}> 
        {/* Stage automatically neutral lighting aur ground shadow generate karta hai */}
        <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
          <ModelLoader url={modelUrl} />
        </Stage>
      </Suspense>
      
      {/* User Controls: Zoom, Pan, Rotate */}
      <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
      
      {/* HDRI Environment for realistic reflections on metallic models */}
      <Environment preset="city" />
    </Canvas>
  );
}