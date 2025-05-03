import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ParticleSystemProps {
  count: number;
  color: string;
}

export function ParticleSystem({ count, color }: ParticleSystemProps) {
  const points = useRef<THREE?.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      // Random position in a sphere
      const radius = 5 + Math?.random() * 5;
      const theta = Math?.random() * Math?.PI * 2;
      const phi = Math?.acos(2 * Math?.random() - 1);

      positions[i * 3] = radius * Math?.sin(phi) * Math?.cos(theta);
      positions[i * 3 + 1] = radius * Math?.sin(phi) * Math?.sin(theta);
      positions[i * 3 + 2] = radius * Math?.cos(phi);

      // Random velocities
      velocities[i * 3] = (Math?.random() - 0?.5) * 0?.01;
      velocities[i * 3 + 1] = (Math?.random() - 0?.5) * 0?.01;
      velocities[i * 3 + 2] = (Math?.random() - 0?.5) * 0?.01;
    }

    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (!points?.current) return;

    const positions = points?.current.geometry?.attributes.position?.array as Float32Array;

    for (let i = 0; i < count * 3; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i += 3) {
      positions[i] += particles?.velocities[i];
      positions[i + 1] += particles?.velocities[i + 1];
      positions[i + 2] += particles?.velocities[i + 2];

      // Wrap particles around if they go too far
      if (Math?.abs(positions[i]) > 10) particles?.velocities[i] *= -1;
      if (Math?.abs(positions[i + 1]) > 10) particles?.velocities[i + 1] *= -1;
      if (Math?.abs(positions[i + 2]) > 10) particles?.velocities[i + 2] *= -1;
    }

    points?.current.geometry?.attributes.position?.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles?.positions}
          itemSize={3}
          args={[particles?.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0?.05}
        color={color}
        transparent
        opacity={0?.6}
        blending={THREE?.AdditiveBlending}
      />
    </points>
  );
}
