
import React, { useRef, useEffect } from 'react';
import type { PlotDataPoint } from '../types';

interface SimulationTabProps {
  simulationCode: string | null;
  plotData: PlotDataPoint[] | null;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({ simulationCode, plotData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container || !simulationCode || !plotData || plotData.length === 0) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawFn: (ctx: CanvasRenderingContext2D, data: PlotDataPoint[], time: number, canvas: HTMLCanvasElement) => void;
    try {
      const code = `return ${simulationCode}`;
      drawFn = new Function(code)();
    } catch (e) {
      console.error("Error creating simulation function:", e);
      return;
    }
    
    const resizeCanvas = () => {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp;
      }
      const elapsedTime = (timestamp - startTimeRef.current) / 1000; // time in seconds
      
      const tMax = plotData[plotData.length - 1].t;
      const animationTime = elapsedTime % tMax; // Loop the animation

      drawFn(ctx, plotData, animationTime, canvas);
      
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      startTimeRef.current = undefined;
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [simulationCode, plotData]);

  if (!simulationCode || !plotData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        داده‌ای برای شبیه‌سازی وجود ندارد.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 md:p-4">
        <canvas ref={canvasRef} className="w-full h-full bg-gray-900/50 rounded-lg border border-gray-700"></canvas>
    </div>
  );
};
