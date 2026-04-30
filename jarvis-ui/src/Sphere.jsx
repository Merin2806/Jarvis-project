import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export default function Sphere() {

  const core = useRef();
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame(() => {

    ring1.current.rotation.z += 0.003;
    ring2.current.rotation.z -= 0.002;

  });

  return (
    <group>

      {/* ENERGY CORE */}

      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#6cf0ff"
          emissive="#6cf0ff"
          emissiveIntensity={2.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* INNER RING */}

      <mesh ref={ring1}>
        <torusGeometry args={[1.4, 0.05, 32, 100]} />
        <meshStandardMaterial
          color="#7df9ff"
          emissive="#7df9ff"
          emissiveIntensity={2}
        />
      </mesh>

      {/* OUTER RING */}

      <mesh ref={ring2}>
        <torusGeometry args={[1.8, 0.03, 32, 100]} />
        <meshStandardMaterial
          color="#00eaff"
          emissive="#00eaff"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* TEXT */}

      <Text
        position={[0,0,1.2]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        JARVIS
      </Text>

    </group>
  );
}