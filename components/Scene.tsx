import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { DirectionalLight, Group, Vector3 } from 'three';
import { NovaTerra } from './NovaTerra';

export const Scene: React.FC = () => {
  // References for animation
  const sunARef = useRef<DirectionalLight>(null);
  const sunBRef = useRef<DirectionalLight>(null);
  const starsRef = useRef<Group>(null);
  
  // Shared state for Sun Position (to drive Planet Shader)
  const sunPositionRef = useRef(new Vector3(10, 5, 10));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // --- ORBITAL SIMULATION (Relativistic Frame) ---
    // To keep the planet centered for the user (UI/UX), we simulate the orbit
    // by moving the universe around the planet. This is mathematically identical
    // to the planet orbiting the star.

    // 1. Nova Terra's Year (Orbit around Alpha Centauri A)
    // The main sun moves around the planet.
    const yearDuration = 60; // Seconds for a full revolution (Scaled down from 550 days)
    const orbitRadiusA = 12; // Distance to main star
    const orbitSpeedA = (2 * Math.PI) / yearDuration;
    
    // Calculate Sun A Position (The "Center" of the solar system relative to us)
    const sunAX = Math.sin(t * orbitSpeedA) * orbitRadiusA;
    const sunAZ = Math.cos(t * orbitSpeedA) * orbitRadiusA;

    // Update the shared ref for the planet component
    sunPositionRef.current.set(sunAX, 5, sunAZ);

    if (sunARef.current) {
      sunARef.current.position.copy(sunPositionRef.current);
    }

    // 2. Binary System Dynamics (Alpha Centauri B orbiting A)
    // The second star orbits the main star, not the planet directly.
    const binaryPeriod = 20; // Seconds
    const orbitRadiusB = 4; // Distance from Star A
    const orbitSpeedB = (2 * Math.PI) / binaryPeriod;

    if (sunBRef.current) {
      // B's position is relative to A
      const sunBX = sunAX + Math.sin(t * orbitSpeedB) * orbitRadiusB;
      const sunBZ = sunAZ + Math.cos(t * orbitSpeedB) * orbitRadiusB;
      // B is often in a slightly different plane
      const sunBY = 2 + Math.sin(t * 0.5) * 2; 

      sunBRef.current.position.set(sunBX, sunBY, sunBZ);
    }

    // 3. Galactic Background Parallax
    // Rotates slowly to simulate the solar system moving through the galaxy
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.005;
      starsRef.current.rotation.z = t * 0.002;
    }
  });

  return (
    <>
      {/* --- Lighting: Binary Star System --- */}
      
      {/* 1. Ambient Light: Deep Space / Night Side */}
      {/* Kept low to ensure the night side features (bioluminescence) pop */}
      <ambientLight intensity={0.02} color="#1a103c" />
      
      {/* 2. Alpha Centauri A (Main Sun): Type G2V (Yellow-White) */}
      <directionalLight 
        ref={sunARef}
        // Initial position will be overwritten by useFrame
        position={[10, 5, 10]} 
        intensity={3.5} 
        color="#fff8e7" 
        castShadow 
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* 3. Alpha Centauri B (The Distant Companion): Type K1V (Deep Orange) */}
      <directionalLight 
        ref={sunBRef}
        position={[-10, 5, -10]} 
        intensity={1.0} 
        color="#ff8844" 
        castShadow={false} // Performance optimization
      />
      
      {/* Rim light (Simulating Atmospheric scattering from space) */}
      <spotLight 
        position={[0, 15, 0]} 
        intensity={0.2} 
        color="#4f46e5" 
        angle={1.5} 
        penumbra={1} 
        distance={30}
      />

      {/* --- Environment --- */}
      <group ref={starsRef}>
        <Stars 
          radius={300} 
          depth={100} 
          count={10000} 
          factor={6} 
          saturation={1} 
          fade 
          speed={0} // Handled in useFrame
        />
      </group>
      
      {/* Nebula/Fog for depth */}
      <fog attach="fog" args={['#020205', 10, 60]} />

      {/* --- Main Subject --- */}
      {/* Pass the sun position ref to enable Day/Night cycle shader logic */}
      <NovaTerra sunPosition={sunPositionRef} />

      {/* --- Controls --- */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={2} 
        maxDistance={8}
        autoRotate={true}
        autoRotateSpeed={0.8} // Planetary Rotation
        dampingFactor={0.05}
      />
    </>
  );
};