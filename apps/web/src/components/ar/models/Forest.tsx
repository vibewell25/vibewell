import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';

export function Forest() {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <Box args={[20, 0.1, 20]} position={[0, -1, 0]} material-color="#4a5d23" />

      {/* Trees */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = Math.random() * 16 - 8;
        const z = Math.random() * 16 - 8;
        const height = 2 + Math.random() * 2;

        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tree trunk */}
            <Box args={[0.3, height, 0.3]} position={[0, height / 2, 0]} material-color="#5c4033" />
            {/* Tree top */}
            <Sphere args={[1, 16, 16]} position={[0, height + 0.5, 0]} material-color="#2d5a27" />
          </group>
        );
      })}
    </group>
  );
}
