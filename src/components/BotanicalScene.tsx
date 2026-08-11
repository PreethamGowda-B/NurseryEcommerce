import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { BotanicalPlant } from './BotanicalPlant';
import { AtmosphericParticles } from './AtmosphericParticles';

interface SceneContentProps {
  scrollProgress: number;
  isMobile: boolean;
}

const CameraRig: React.FC<{ scrollProgress: number; isMobile: boolean }> = ({ scrollProgress, isMobile }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  useFrame(() => {
    if (!cameraRef.current) return;

    const p = Math.max(0, Math.min(1, scrollProgress));

    // Plant is located at X = 3.4 (desktop) and X = 0 (mobile)
    let plantX = isMobile ? 0.0 : 3.4;

    let targetX = 0.0;
    let targetY = 0.8;
    let targetZ = 7.2;
    let lookX = 0.0;
    let lookY = 0.5;

    if (p < 0.4) {
      const t = p / 0.4;
      targetX = THREE.MathUtils.lerp(0.0, plantX - 1.2, t);
      targetY = THREE.MathUtils.lerp(0.8, 1.2, t);
      targetZ = THREE.MathUtils.lerp(7.2, 5.0, t);
      lookX = THREE.MathUtils.lerp(0.0, plantX - 0.4, t);
      lookY = THREE.MathUtils.lerp(0.5, 1.0, t);
    } else if (p < 0.75) {
      const t = (p - 0.4) / 0.35;
      targetX = THREE.MathUtils.lerp(plantX - 1.2, plantX - 0.6, t);
      targetY = THREE.MathUtils.lerp(1.2, 1.6, t);
      targetZ = THREE.MathUtils.lerp(5.0, 2.5, t);
      lookX = plantX;
      lookY = THREE.MathUtils.lerp(1.0, 1.5, t);
    } else {
      const t = (p - 0.75) / 0.25;
      targetX = THREE.MathUtils.lerp(plantX - 0.6, plantX, t);
      targetY = THREE.MathUtils.lerp(1.6, 1.8, t);
      targetZ = THREE.MathUtils.lerp(2.5, 0.6, t);
      lookX = plantX;
      lookY = THREE.MathUtils.lerp(1.5, 1.8, t);
    }

    cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.1);
    cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.1);
    cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetZ, 0.1);

    cameraRef.current.lookAt(lookX, lookY, 0);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={45} position={[0, 0.8, 7.2]} />;
};

const SceneContent: React.FC<SceneContentProps> = ({ scrollProgress, isMobile }) => {
  const plantGrowth = Math.min(1.0, 0.15 + scrollProgress * 1.5);
  const shadowX = isMobile ? 0.0 : 3.4;

  return (
    <>
      <CameraRig scrollProgress={scrollProgress} isMobile={isMobile} />

      {/* Sunlit Botanical Lighting */}
      <ambientLight intensity={1.4} color="#fffdfa" />

      <directionalLight
        position={[6, 9, 5]}
        intensity={2.0}
        color="#fff8ea"
      />

      <directionalLight
        position={[-5, 4, -3]}
        intensity={0.6}
        color="#a3b18a"
      />

      {/* Airborne particles (Optimized count for 60 FPS) */}
      <AtmosphericParticles count={isMobile ? 40 : 100} />

      {/* 3D Botanical Plant Specimen */}
      <BotanicalPlant growthProgress={plantGrowth} />

      {/* Ground Shadow Plane */}
      <mesh position={[shadowX, -2.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial
          color="#386641"
          transparent
          opacity={0.12}
        />
      </mesh>
    </>
  );
};

interface BotanicalSceneProps {
  scrollProgress: number;
}

export const BotanicalScene: React.FC<BotanicalSceneProps> = ({ scrollProgress }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const sceneOpacity = scrollProgress > 0.82 ? Math.max(0, 1 - (scrollProgress - 0.82) / 0.16) : 1;

  if (sceneOpacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-300"
      style={{ opacity: sceneOpacity }}
    >
      <Canvas
        shadows={false}
        dpr={isMobile ? [1, 1] : [1, 1.2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <color attach="background" args={['#f6f4ee']} />
        <SceneContent scrollProgress={scrollProgress} isMobile={isMobile} />
      </Canvas>

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-radial-vignette-bright pointer-events-none opacity-40" />
    </div>
  );
};
