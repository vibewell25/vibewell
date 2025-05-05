import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';

export function Mountain() {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
return (
    <group ref={groupRef}>
      {/* Ground */}
      <Box args={[20, 0.1, 20]} position={[0, -1, 0]} material-color="#4a5d23" />

      {/* Mountains */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = Math.random() * 16 - 8;
        const z = Math.random() * 16 - 8;
        const height = 4 + Math.random() * 3;
        const width = 2 + Math.random() * 2;

        return (
          <group key={i} position={[x, 0, z]}>
            {/* Mountain Base */}
            <Cylinder
              args={[width, width * 0.5, height, 8]}
              position={[0, height / 2, 0]}
              material-color="#4a4a4a"
            />

            {/* Snow Cap */}
            <Cylinder
              args={[width * 0.8, width, height * 0.2, 8]}
              position={[0, height - 0.2, 0]}
              material-color="#ffffff"
            />

            {/* Rocks */}
            {Array.from({ length: 3 }).map((_, j) => {
              const rockX = Math.random() * 2 - 1;
              const rockZ = Math.random() * 2 - 1;
              const rockSize = 0.3 + Math.random() * 0.4;

              return (
                <Sphere
                  key={j}
                  args={[rockSize, 6, 6]}
                  position={[x + rockX * width, -0.5 + rockSize / 2, z + rockZ * width]}
                  material-color="#696969"
                />
)}
          </group>
)}

      {/* Distant Mountains (Background) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 3 + Math.random() * 2;

        return (
          <Cylinder
            key={`bg-${i}`}
            args={[1.5, 2, height, 8]}
            position={[x, height / 2 - 1, z]}
            material-color="#363636"
          />
)}
    </group>
