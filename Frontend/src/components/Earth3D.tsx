import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <Sphere args={[2.15, 64, 64]}>
        <meshBasicMaterial color="#00F5FF" transparent opacity={0.03} side={THREE.BackSide} />
      </Sphere>
      <Sphere args={[2.3, 32, 32]}>
        <meshBasicMaterial color="#00F5FF" transparent opacity={0.015} side={THREE.BackSide} />
      </Sphere>
      {/* Main sphere */}
      <Sphere ref={meshRef} args={[2, 128, 128]}>
        <MeshDistortMaterial
          color="#0B2545"
          emissive="#00F5FF"
          emissiveIntensity={0.15}
          roughness={0.7}
          metalness={0.3}
          distort={0.2}
          speed={1.5}
        />
      </Sphere>
      {/* Grid lines */}
      <Sphere args={[2.02, 32, 32]} ref={(ref) => {
        if (ref) {
          ref.rotation.y = 0;
        }
      }}>
        <meshBasicMaterial color="#00F5FF" wireframe transparent opacity={0.08} />
      </Sphere>
    </group>
  );
}

export default function Earth3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} color="#00F5FF" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#00FFA3" />
        <pointLight position={[0, 0, 4]} intensity={0.5} color="#00F5FF" />
        <EarthMesh />
      </Canvas>
    </div>
  );
}
