import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';

export function ZenGarden() {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sand Base */}
      <Box args={[20, 0.1, 20]} position={[0, -1, 0]} material-color="#e8d0a9" />
      {/* Sand Patterns */}
      {Array.from({ length: 20 }).map((_, i) => {
        const radius = (i + 1) * 0.8;
        return (
          <group key={i}>
            {Array.from({ length: 60 }).map((_, j) => {
              const angle = (j / 60) * Math.PI * 2;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              return (
                <Box
                  key={j}
                  args={[0.1, 0.02, 0.1]}
                  position={[x, -0.95, z]}
                  rotation={[0, angle, 0]}
                  material-color="#d4c19c"
                />
              );
            })}
          </group>
        );
      })}
      {/* Rocks */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.5 + Math.random() * 1;

        return (
          <group key={i} position={[x, -1 + scale / 2, z]}>
            <Sphere
              args={[scale, 8, 8]}
              material-color="#696969"
              material-roughness={0.8}
              material-metalness={0.2}
            />
          </group>
        );
      })}
      {/* Bamboo Plants */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={i} position={[x, 0, z]}>
            {/* Bamboo Stalks */}
            {Array.from({ length: 3 }).map((_, j) => {
              const offsetX = Math.random() * 0.5 - 0.25;
              const offsetZ = Math.random() * 0.5 - 0.25;

              return (
                <group key={j}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Cylinder
                      key={k}
                      args={[0.1, 0.1, 0.5, 8]}
                      position={[offsetX, k * 0.5, offsetZ]}
                      material-color="#90EE90"
                    />
                  ))}
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
