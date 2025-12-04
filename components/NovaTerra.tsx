import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Color, BackSide, AdditiveBlending, DoubleSide, CanvasTexture, MeshStandardMaterial, Vector3 } from 'three';

// --- Atmosphere Shader (Deep Indigo with Color Shift) ---
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    // Calculate angle between surface normal and view direction (0,0,1 in view space)
    float viewDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
    
    // Fresnel Effect: Higher intensity at the edges (viewDot close to 0)
    // Adjusted power for a softer, more extended glow
    float intensity = pow(0.75 - viewDot, 3.5);

    // Color Palette
    vec3 deepIndigo = vec3(0.2, 0.1, 0.7); // Base atmosphere color
    vec3 electricBlue = vec3(0.4, 0.7, 1.0); // Edge highlight

    // Color shift: Mix colors based on intensity to create a gradient at the rim
    vec3 finalColor = mix(deepIndigo, electricBlue, intensity * 0.8);

    // Final output with boosted intensity
    gl_FragColor = vec4(finalColor, 1.0) * intensity * 3.5;
  }
`;

// --- Procedural Generation Helpers ---

// Simple pseudo-random noise function
const noise = (x: number, y: number, seed: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

// Fractal Brownian Motion for terrain detail
const fbm = (x: number, y: number, seed: number) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  for (let i = 0; i < 6; i++) {
    const ix = Math.floor(x * frequency);
    const iy = Math.floor(y * frequency);
    const fx = x * frequency - ix;
    const fy = y * frequency - iy;
    
    const a = noise(ix, iy, seed);
    const b = noise(ix + 1, iy, seed);
    const c = noise(ix, iy + 1, seed);
    const d = noise(ix + 1, iy + 1, seed);
    
    const ux = fx * fx * (3.0 - 2.0 * fx);
    const uy = fy * fy * (3.0 - 2.0 * fy);
    
    const val = (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
    
    value += val * amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
};

// Generate textures for the planet
const generatePlanetTextures = () => {
  const width = 1024;
  const height = 512;
  const canvasColor = document.createElement('canvas');
  const canvasBump = document.createElement('canvas');
  const canvasRoughness = document.createElement('canvas'); // For Standard Material
  const canvasEmissive = document.createElement('canvas'); // For Night Lights
  const canvasClouds = document.createElement('canvas');

  canvasColor.width = canvasBump.width = canvasRoughness.width = canvasEmissive.width = canvasClouds.width = width;
  canvasColor.height = canvasBump.height = canvasRoughness.height = canvasEmissive.height = canvasClouds.height = height;

  const ctxColor = canvasColor.getContext('2d')!;
  const ctxBump = canvasBump.getContext('2d')!;
  const ctxRoughness = canvasRoughness.getContext('2d')!;
  const ctxEmissive = canvasEmissive.getContext('2d')!;
  const ctxClouds = canvasClouds.getContext('2d')!;

  const imgDataColor = ctxColor.createImageData(width, height);
  const imgDataBump = ctxBump.createImageData(width, height);
  const imgDataRoughness = ctxRoughness.createImageData(width, height);
  const imgDataEmissive = ctxEmissive.createImageData(width, height);
  const imgDataClouds = ctxClouds.createImageData(width, height);

  // Palette
  const deepOcean = { r: 10, g: 10, b: 60 }; // Dark Indigo
  const shallowOcean = { r: 30, g: 50, b: 120 }; // Lighter Blue
  const beach = { r: 194, g: 178, b: 128 };
  const forest = { r: 10, g: 80, b: 20 }; // Deep Green (Emerald Horizon)
  const jungle = { r: 5, g: 50, b: 10 }; // Darker Green (Wild Heart)
  const mountain = { r: 80, g: 70, b: 60 }; // Grey/Brown
  const snow = { r: 240, g: 250, b: 255 };

  const seed = Math.random() * 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Normalize coordinates
      const nx = x / width;
      const ny = y / height;
      
      // Map to sphere coordinates for seamless noise
      const u = nx * Math.PI * 2;
      const v = ny * Math.PI;

      // Base Continent Noise (Frequency 4.0 for distinct continents)
      let h = fbm(nx * 4.0, ny * 4.0, seed);
      
      // Archipelago Noise
      const equatorDist = Math.abs(ny - 0.5) * 2; 
      const archipelagoMask = 1.0 - Math.pow(equatorDist, 2); 
      const archNoise = fbm(nx * 15, ny * 15, seed + 20);
      
      if (archipelagoMask > 0.6 && archNoise > 0.6) {
         h = Math.max(h, archNoise * 0.9);
      }

      // Polar Caps
      if (ny < 0.1 || ny > 0.9) {
        h += 0.4 * Math.pow(Math.abs(ny < 0.5 ? ny : 1 - ny) * 10, 2); 
      }

      const i = (y * width + x) * 4;

      // Water Level ~70%
      const waterLevel = 0.60;

      let r, g, b, roughness, bump, emR = 0, emG = 0, emB = 0;

      if (h < waterLevel) {
        // OCEAN
        const depth = h / waterLevel;
        r = deepOcean.r * (1 - depth) + shallowOcean.r * depth;
        g = deepOcean.g * (1 - depth) + shallowOcean.g * depth;
        b = deepOcean.b * (1 - depth) + shallowOcean.b * depth;
        roughness = 0.2; // Shiny water
        bump = h * 0.5; // Smooth
      } else {
        // LAND
        const altitude = (h - waterLevel) / (1 - waterLevel);
        roughness = 0.8; // Matte land
        bump = h * 255; 

        // Biome Selector
        // We use a secondary noise to decide between "Esmeralda" (Forest) and "Salvaje" (Jungle)
        const biomeNoise = noise(nx * 5, ny * 5, seed + 50);

        if (altitude < 0.05) { // Beach
          r = beach.r; g = beach.g; b = beach.b;
        } else if (altitude < 0.45) { // Vegetation
          
          if (biomeNoise > 0.5) {
             // Horizonte Esmeralda (Forests + Crystal Plains)
             r = forest.r; g = forest.g; b = forest.b;
             
             // Occasional crystal reflection
             if (noise(nx * 50, ny * 50, seed + 80) > 0.85) {
                emR = 0; emG = 60; emB = 100; // Cyan glow (brighter for visibility)
             }
          } else {
             // Corazón Salvaje (Jungle + Bioluminescence)
             r = jungle.r; g = jungle.g; b = jungle.b;
             
             // Bioluminescent plants at night
             const bioNoise = noise(nx * 60, ny * 60, seed + 90);
             if (bioNoise > 0.65) {
                emR = 20; emG = 240; emB = 160; // Teal/Green glow (Brighter)
             }
          }

        } else if (altitude < 0.75) { // Mountain / Volcanic
          r = mountain.r; g = mountain.g; b = mountain.b;
          
          // Espina de los Titanes (Volcanic Activity)
          // High altitude + noise = Lava
          const lavaNoise = noise(nx * 40, ny * 40, seed + 10);
          if (lavaNoise > 0.7 && altitude > 0.6) {
             emR = 255; emG = 80; emB = 10; // Lava glow
             r = 20; g = 5; b = 5; // Dark rock around lava
          }

        } else { // Snow / Ice
          r = snow.r; g = snow.g; b = snow.b;
          roughness = 0.3; // Shiny ice
        }
      }

      // Polar Cap Override
      if (ny < 0.08 || ny > 0.92) {
         r = snow.r; g = snow.g; b = snow.b;
         roughness = 0.1;
         bump = 150;
         emR = 0; emG = 0; emB = 0; // No glow on ice
      }

      // Color Map
      imgDataColor.data[i] = r;
      imgDataColor.data[i + 1] = g;
      imgDataColor.data[i + 2] = b;
      imgDataColor.data[i + 3] = 255;

      // Bump Map
      imgDataBump.data[i] = bump;
      imgDataBump.data[i + 1] = bump;
      imgDataBump.data[i + 2] = bump;
      imgDataBump.data[i + 3] = 255;

      // Roughness Map (Inverse of Specular)
      imgDataRoughness.data[i] = roughness * 255;
      imgDataRoughness.data[i + 1] = roughness * 255;
      imgDataRoughness.data[i + 2] = roughness * 255;
      imgDataRoughness.data[i + 3] = 255;

      // Emissive Map (Night Lights)
      imgDataEmissive.data[i] = emR;
      imgDataEmissive.data[i + 1] = emG;
      imgDataEmissive.data[i + 2] = emB;
      imgDataEmissive.data[i + 3] = 255;

      // Cloud Map
      const cloudNoise = fbm(nx * 8 + seed, ny * 8, seed + 100);
      const cloudVal = cloudNoise > 0.55 ? (cloudNoise - 0.55) * 2.5 * 255 : 0;
      imgDataClouds.data[i] = 255;
      imgDataClouds.data[i + 1] = 255;
      imgDataClouds.data[i + 2] = 255;
      imgDataClouds.data[i + 3] = cloudVal; // Alpha
    }
  }

  ctxColor.putImageData(imgDataColor, 0, 0);
  ctxBump.putImageData(imgDataBump, 0, 0);
  ctxRoughness.putImageData(imgDataRoughness, 0, 0);
  ctxEmissive.putImageData(imgDataEmissive, 0, 0);
  ctxClouds.putImageData(imgDataClouds, 0, 0);

  return {
    map: new CanvasTexture(canvasColor),
    bumpMap: new CanvasTexture(canvasBump),
    roughnessMap: new CanvasTexture(canvasRoughness),
    emissiveMap: new CanvasTexture(canvasEmissive),
    cloudsMap: new CanvasTexture(canvasClouds)
  };
};

interface NovaTerraProps {
  sunPosition?: React.MutableRefObject<Vector3>;
}

export const NovaTerra: React.FC<NovaTerraProps> = ({ sunPosition }) => {
  const planetRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  
  const [textures, setTextures] = useState<{
    map: CanvasTexture;
    bumpMap: CanvasTexture;
    roughnessMap: CanvasTexture;
    emissiveMap: CanvasTexture;
    cloudsMap: CanvasTexture;
  } | null>(null);

  useEffect(() => {
    const generated = generatePlanetTextures();
    setTextures(generated);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.03; 
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.045; 
      cloudsRef.current.rotation.x = Math.sin(t * 0.05) * 0.002; 
    }

    // Dynamic Day/Night Shader Update
    if (materialRef.current && materialRef.current.userData.shader && sunPosition && sunPosition.current) {
      // Pass the current Sun Position (World Space) to the shader
      materialRef.current.userData.shader.uniforms.uSunPosition.value.copy(sunPosition.current);
    }
  });

  // Shader Modification for Day/Night Cycle
  const handleOnBeforeCompile = (shader: any) => {
    // Add uniform
    shader.uniforms.uSunPosition = { value: new Vector3(10, 5, 10) };
    
    // Pass shader ref to material userData so we can update it in useFrame
    if (materialRef.current) {
      materialRef.current.userData.shader = shader;
    }

    // Inject Uniform definition
    shader.fragmentShader = `
      uniform vec3 uSunPosition;
    ` + shader.fragmentShader;

    // Inject Logic into Emissive fragment
    // We calculate the dot product between the view-space Normal and the Light direction.
    // If the surface faces AWAY from the light, we boost the emissive color.
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>

      // Calculate Light Direction in View Space
      // View Matrix transforms World Position to Camera Space
      // uSunPosition is in World Space. 
      vec3 sunPosView = (viewMatrix * vec4(uSunPosition, 1.0)).xyz;
      
      // Vector from Fragment to Sun? 
      // Standard Directional Light vector calculation usually involves simple normalization if it's "infinite distance".
      // But since we are simulating the position for the shader effect, let's treat uSunPosition as the point source.
      
      vec3 lightDir = normalize(sunPosView - vViewPosition);

      // Dot product: 1.0 = Facing Sun directly, -1.0 = Facing away completely
      float dotNL = dot(vNormal, lightDir);

      // Create a smooth mask for the "Dark Side"
      // smoothstep(0.1, -0.3, dotNL) -> Starts transitioning near terminator line, full intensity in shadow
      float nightMask = smoothstep(0.15, -0.25, dotNL);

      // Apply Night Boost
      // totalEmissiveRadiance is the base emissive color (from texture * intensity prop)
      // We multiply it to make it barely visible during day (base intensity) and very bright at night.
      
      // Base glow (Day) is kept low or zero depending on texture
      // Night glow is boosted 4x
      
      // NOTE: totalEmissiveRadiance is a vec3 variable in the standard shader
      totalEmissiveRadiance *= (0.5 + 4.5 * nightMask);
      `
    );
  };

  const atmosphereMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: AdditiveBlending,
      side: BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  if (!textures) return null;

  return (
    <group rotation={[0, 0, 23.5 * (Math.PI / 180)]}> 
      {/* 1. Surface (Standard Material for PBR) */}
      <mesh ref={planetRef} receiveShadow castShadow>
        <sphereGeometry args={[1, 128, 128]} /> 
        <meshStandardMaterial 
          ref={materialRef}
          onBeforeCompile={handleOnBeforeCompile}
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={0.08}
          roughnessMap={textures.roughnessMap}
          metalness={0.1}
          emissiveMap={textures.emissiveMap}
          emissive={new Color(0xffffff)}
          emissiveIntensity={1.0} // Base intensity, shader boosts this at night
        />
      </mesh>

      {/* 2. Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.015, 128, 128]} />
        <meshStandardMaterial 
          map={textures.cloudsMap}
          transparent={true}
          opacity={0.9} 
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
          color={new Color(0xddeeff)} 
        />
      </mesh>

      {/* 3. Atmosphere Halo */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  );
};