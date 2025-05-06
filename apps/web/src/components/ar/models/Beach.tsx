import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder } from '@react-three/drei';

export function Beach() {
  const waterRef = useRef(null);
  const groupRef = useRef(null);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
return (
    <group ref={groupRef}>
      {/* Sand */}
      <Box args={[20, 0.1, 20]} position={[0, -1, 0]} material-color="#f2d16b" />

      {/* Water */}
      <Box
        ref={waterRef}
        args={[30, 0.1, 30]}
        position={[0, -1.2, -15]}
        material-color="#0077be"
        material-transparent
        material-opacity={0.6}
        material-metalness={0.2}
        material-roughness={0.1}
      />

      {/* Palm Trees */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = Math.random() * 16 - 8;
        const z = Math.random() * 8 - 4;
        const height = 3 + Math.random() * 2;
        const lean = Math.random() * 0.3 - 0.15;

        return (
          <group key={i} position={[x, 0, z]} rotation={[0, Math.random() * Math.PI * 2, lean]}>
            {/* Trunk */}
            <Cylinder args={[0.2, 0.3, height, 8]} position={[0, height / 2, 0]} material-color="#8b4513" />

            {/* Palm Leaves */}
            {Array.from({ length: 6 }).map((_, j) => (
              <group
                key={j}
                position={[0, height - 0.5, 0]}
                rotation={[Math.random() * 0.5 - 0.25, (j * Math.PI * 2) / 6, Math.PI * 0.25]}
              >
                <Box args={[0.1, 2, 0.5]} position={[0, 1, 0]} material-color="#228b22" />
              </group>
            ))}
          </group>
)}
    </group>
