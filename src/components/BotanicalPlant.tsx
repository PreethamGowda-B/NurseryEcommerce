import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BotanicalPlantProps {
  growthProgress: number; // 0.0 to 1.0
  windSpeed?: number;
}

export const BotanicalPlant: React.FC<BotanicalPlantProps> = ({ growthProgress, windSpeed = 1.0 }) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Organic Monstera Leaf Shape
  const leafShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.35, 0.4, 0.7, 1.2, 0.95, 2.0);
    shape.bezierCurveTo(0.75, 2.6, 0.4, 3.0, 0, 3.6);
    shape.bezierCurveTo(-0.4, 3.0, -0.75, 2.6, -0.95, 2.0);
    shape.bezierCurveTo(-0.7, 1.2, -0.35, 0.4, 0, 0);
    return shape;
  }, []);

  const leafExtrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.012,
    bevelEnabled: false,
  }), []);

  // Main S-Curve Stem
  const centralStemCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.5, 0),
      new THREE.Vector3(0.24, -0.5, 0.08),
      new THREE.Vector3(-0.18, 0.8, -0.05),
      new THREE.Vector3(0.14, 2.0, 0.04),
      new THREE.Vector3(0, 3.4, 0),
    ]);
  }, []);

  // Side Branch 1 (Left branch)
  const branch1Curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 1.2, 0),
      new THREE.Vector3(-0.55, 1.55, 0.2),
      new THREE.Vector3(-0.95, 1.95, 0.3),
    ]);
  }, []);

  // Side Branch 2 (Right branch)
  const branch2Curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 2.0, 0),
      new THREE.Vector3(0.55, 2.35, -0.15),
      new THREE.Vector3(0.95, 2.75, -0.2),
    ]);
  }, []);

  // Multi-Leaf Layout Configuration (12 Leaves)
  const leafConfigs = useMemo(() => [
    { height: 0.4, rotY: 0, tiltX: 0.8, scale: 0.55, color: '#2d6a4f', delay: 0.0 },
    { height: 0.8, rotY: Math.PI * 0.5, tiltX: 0.85, scale: 0.65, color: '#386641', delay: 0.05 },
    { height: 1.2, rotY: Math.PI * 1.1, tiltX: 0.75, scale: 0.75, color: '#1b4332', delay: 0.1 },
    { height: 1.6, rotY: Math.PI * 0.4, tiltX: 0.8, scale: 0.85, color: '#52b788', delay: 0.15 },
    { height: 2.0, rotY: Math.PI * 1.6, tiltX: 0.7, scale: 0.95, color: '#2d6a4f', delay: 0.2 },
    { height: 2.4, rotY: Math.PI * 0.8, tiltX: 0.9, scale: 1.05, color: '#386641', delay: 0.25 },
    { height: 2.8, rotY: Math.PI * 1.4, tiltX: 0.65, scale: 1.0, color: '#1b4332', delay: 0.3 },
    { height: 3.2, rotY: Math.PI * 0.1, tiltX: 0.75, scale: 0.9, color: '#52b788', delay: 0.35 },

    // Branch 1 leaves (Left side)
    { height: 1.4, rotY: -Math.PI * 0.4, tiltX: 0.9, scale: 0.7, color: '#386641', delay: 0.2, posX: -0.55, posY: 1.55, posZ: 0.2 },
    { height: 1.8, rotY: -Math.PI * 0.6, tiltX: 0.85, scale: 0.8, color: '#52b788', delay: 0.3, posX: -0.95, posY: 1.95, posZ: 0.3 },

    // Branch 2 leaves (Right side)
    { height: 2.2, rotY: Math.PI * 0.6, tiltX: 0.85, scale: 0.75, color: '#2d6a4f', delay: 0.3, posX: 0.55, posY: 2.35, posZ: -0.15 },
    { height: 2.6, rotY: Math.PI * 0.75, tiltX: 0.8, scale: 0.85, color: '#386641', delay: 0.4, posX: 0.95, posY: 2.75, posZ: -0.2 },
  ], []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime() * windSpeed;
    groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.02;
    groupRef.current.rotation.x = Math.cos(time * 0.6) * 0.015;
  });

  const clampedGrowth = Math.max(0.05, Math.min(1.0, growthProgress));
  const stemScaleY = clampedGrowth;

  return (
    <group ref={groupRef} position={[3.4, -1.2, 0]}>
      
      {/* Central Main Stem */}
      <mesh receiveShadow castShadow>
        <tubeGeometry args={[centralStemCurve, 32, 0.07, 8, false]} />
        <meshStandardMaterial
          color="#1b4332"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Side Branch 1 (Left) */}
      {clampedGrowth > 0.15 && (
        <mesh receiveShadow castShadow>
          <tubeGeometry args={[branch1Curve, 16, 0.045, 8, false]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.4} />
        </mesh>
      )}

      {/* Side Branch 2 (Right) */}
      {clampedGrowth > 0.25 && (
        <mesh receiveShadow castShadow>
          <tubeGeometry args={[branch2Curve, 16, 0.045, 8, false]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.4} />
        </mesh>
      )}

      {/* Elegant Ceramic Planter Pot */}
      <group position={[0, -1.6, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.95, 0.68, 1.25, 24]} />
          <meshStandardMaterial
            color="#e5ded6"
            roughness={0.65}
          />
        </mesh>
        {/* Pot Rim */}
        <mesh position={[0, 0.58, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.02, 0.95, 0.22, 24]} />
          <meshStandardMaterial
            color="#d9cfc3"
            roughness={0.6}
          />
        </mesh>
        {/* Soil Surface */}
        <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.92, 24]} />
          <meshStandardMaterial
            color="#2a1f18"
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* Multi-Leaf Foliage Array */}
      {leafConfigs.map((cfg, index) => {
        const leafProgress = Math.max(0, Math.min(1, (clampedGrowth - cfg.delay) / (1 - cfg.delay || 0.01)));
        const currentScale = cfg.scale * leafProgress;
        const currentTilt = cfg.tiltX * leafProgress;

        if (leafProgress <= 0.01) return null;

        const posX = cfg.posX !== undefined ? cfg.posX : centralStemCurve.getPoint(cfg.height / 3.4).x;
        const posY = cfg.posY !== undefined ? cfg.posY * stemScaleY - 0.2 : cfg.height * stemScaleY - 0.5;
        const posZ = cfg.posZ !== undefined ? cfg.posZ : centralStemCurve.getPoint(cfg.height / 3.4).z;

        return (
          <group
            key={index}
            position={[posX, posY, posZ]}
            rotation={[0, cfg.rotY, 0]}
          >
            <group rotation={[currentTilt, 0, 0]} scale={currentScale}>
              {/* Petiole Stem */}
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.018, 0.028, 0.5, 6]} />
                <meshStandardMaterial color="#386641" roughness={0.3} />
              </mesh>

              {/* Leaf Blade */}
              <mesh position={[0, 0.5, 0]} rotation={[-0.2, 0, 0]} castShadow receiveShadow>
                <extrudeGeometry args={[leafShape, leafExtrudeSettings]} />
                <meshStandardMaterial
                  color={cfg.color}
                  roughness={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Leaf Vein */}
              <mesh position={[0, 0.51, 0.015]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[0.02, 2.8, 0.01]} />
                <meshStandardMaterial color="#95d5b2" roughness={0.4} />
              </mesh>
            </group>
          </group>
        );
      })}

    </group>
  );
};
