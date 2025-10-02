import React, { useRef, useEffect } from 'react';
import type { PlotDataPoint } from '../types';

declare const Plotly: any; // Use Plotly from the global scope

interface Plot3DTabProps {
  plotData: PlotDataPoint[] | null;
}

export const Plot3DTab: React.FC<Plot3DTabProps> = ({ plotData }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plotContainer = plotRef.current;
    if (!plotContainer || !plotData || plotData.length === 0) return;

    const xData = plotData.map(p => p.x);
    const yData = plotData.map(p => p.y);
    const zData = plotData.map(p => p.z);

    const trace = {
      x: xData,
      y: yData,
      z: zData,
      mode: 'lines',
      type: 'scatter3d',
      line: {
        color: '#4FD1C5', // cyan-400
        width: 4
      },
      name: 'مسیر حرکت'
    };
    
    const layout = {
      title: 'مسیر حرکت سه بعدی',
      font: {
        color: '#E2E8F0' // gray-200
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      autosize: true,
      scene: {
        xaxis: { title: 'X', color: '#A0AEC0' },
        yaxis: { title: 'Y', color: '#A0AEC0' },
        zaxis: { title: 'Z', color: '#A0AEC0' },
        camera: {
          eye: {x: 1.5, y: 1.5, z: 1.5}
        }
      },
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 40
      }
    };
    
    const config = {
        responsive: true
    };

    Plotly.newPlot(plotContainer, [trace], layout, config);

    // Handle resize
    const handleResize = () => {
        Plotly.Plots.resize(plotContainer);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (plotContainer) {
        Plotly.purge(plotContainer);
      }
    };

  }, [plotData]);
  
  if (!plotData || plotData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        داده‌ای برای رسم نمودار سه بعدی وجود ندارد.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 md:p-4">
      <div ref={plotRef} className="w-full h-full"></div>
    </div>
  );
};
