import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black">
      {/* UI Overlay Layer */}
      <Overlay />

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 45 }}
          gl={{ antialias: true, pixelRatio: window.devicePixelRatio }}
          dpr={[1, 2]} // Performance optimization for high DPI screens
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Loading Indicator */}
      <Loader 
        containerStyles={{ background: '#050505' }}
        barStyles={{ background: '#3b82f6', height: '4px' }}
        dataStyles={{ fontFamily: 'Orbitron', fontSize: '14px' }}
      />
    </div>
  );
};

export default App;