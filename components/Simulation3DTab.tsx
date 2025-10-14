import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PlotDataPoint } from '../types';

interface Simulation3DTabProps {
  simulationCode: string;
  plotData: PlotDataPoint[] | null;
}

export const Simulation3DTab: React.FC<Simulation3DTabProps> = ({ simulationCode, plotData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode || !simulationCode || !plotData || plotData.length === 0) {
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setClearColor(0x1a202c); // bg-gray-800
    mountNode.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Camera initial position based on data
    const xCoords = plotData.map(p => p.x);
    const yCoords = plotData.map(p => p.y);
    const zCoords = plotData.map(p => p.z || 0);
    const avgX = xCoords.reduce((a, b) => a + b, 0) / xCoords.length;
    const avgY = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;
    const avgZ = zCoords.reduce((a, b) => a + b, 0) / zCoords.length;
    const maxDim = Math.max(
        Math.max(...xCoords) - Math.min(...xCoords),
        Math.max(...yCoords) - Math.min(...yCoords),
        Math.max(...zCoords) - Math.min(...zCoords)
    );

    camera.position.set(avgX + maxDim, avgY + maxDim, avgZ + maxDim);
    controls.target.set(avgX, avgY, avgZ);
    
    let drawFn: (scene: THREE.Scene, data: PlotDataPoint[], time: number, three: typeof THREE) => void;
    try {
      const code = `return ${simulationCode}`;
      drawFn = new Function(code)();
    } catch (e) {
      console.error("Error creating 3D simulation function:", e);
      return;
    }

    const handleResize = () => {
      if (mountNode) {
        camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp;
      }
      const elapsedTime = (timestamp - startTimeRef.current) / 1000;
      
      const tMax = plotData[plotData.length - 1].t;
      const animationTime = elapsedTime % tMax;

      try {
        drawFn(scene, plotData, animationTime, THREE);
      } catch (e) {
        console.error("Error executing 3D simulation code:", e);
        // Stop animation on error to prevent console spam
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        return;
      }
      
      controls.update();
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      startTimeRef.current = undefined;
      window.removeEventListener('resize', handleResize);
      if (mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [simulationCode, plotData]);

  if (!simulationCode || !plotData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        داده‌ای برای شبیه‌سازی سه‌بعدی وجود ندارد.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 md:p-4">
        <div ref={mountRef} className="w-full h-full bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"></div>
    </div>
  );
};
