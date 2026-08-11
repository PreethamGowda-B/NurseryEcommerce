import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AtmosphericParticlesProps {
  count?: number;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({ count = 350 }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;     // X spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12; // Y spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z spread
    }
    return [pos];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime() * 0.25;
    const positionsArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle drift floating up & swaying in morning sunlight
      positionsArr[i * 3 + 1] += Math.sin(time + i) * 0.0015 + 0.0008;
      positionsArr[i * 3] += Math.cos(time * 0.4 + i * 2) * 0.001;

      if (positionsArr[i * 3 + 1] > 6) {
        positionsArr[i * 3 + 1] = -6;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#84a98c"
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
};
