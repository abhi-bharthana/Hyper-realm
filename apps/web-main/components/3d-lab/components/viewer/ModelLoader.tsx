import { useGLTF, Center } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

interface ModelLoaderProps {
  url: string;
}

export default function ModelLoader({ url }: ModelLoaderProps) {
  // R3F ka useGLTF hook model ko fetch aur parse karta hai
  const { scene } = useGLTF(url);

  // CRITICAL: Memory cleanup logic for OS environment
  useEffect(() => {
    return () => {
      // Jab window close ho, geometries aur materials ko WebGL context se delete karo
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          }
        }
      });
    };
  }, [scene]);

  return (
    // Center tag automatically model ko pivot point (0,0,0) par align kar deta hai
    <Center>
      <primitive object={scene} castShadow receiveShadow />
    </Center>
  );
}

// Preload the model if needed in background
useGLTF.preload('/default-model.glb');