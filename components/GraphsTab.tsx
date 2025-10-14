import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PlotDataPoint } from '../types';

interface GraphsTabProps {
  plotData: PlotDataPoint[] | null;
}

const ChartWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <h4 className="text-lg font-semibold text-cyan-300 mb-4 text-center">{title}</h4>
        <div className="h-64">
            {children}
        </div>
    </div>
);


export const GraphsTab: React.FC<GraphsTabProps> = ({ plotData }) => {
  if (!plotData || plotData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        داده‌ای برای رسم نمودار وجود ندارد. لطفاً ابتدا یک مسئله را حل کنید.
      </div>
    );
  }

  const hasEnergy = plotData[0]?.energy !== undefined;
  const hasMomentum = plotData[0]?.px !== undefined && plotData[0]?.py !== undefined;
  const has3DPosition = plotData[0]?.z !== undefined;
  const has3DVelocity = plotData[0]?.vz !== undefined;
  const has3DMomentum = hasMomentum && plotData[0]?.pz !== undefined;

  return (
    <div className="h-full overflow-y-auto p-2 sm:p-4 space-y-4">
      <ChartWrapper title="مسیر حرکت (y برحسب x)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="#A0AEC0" name="x" label={{ value: 'x', position: 'insideBottomRight', offset: -5, fill: '#A0AEC0' }} />
            <YAxis type="number" domain={['dataMin', 'dataMax']} stroke="#A0AEC0" name="y" label={{ value: 'y', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
            <Legend />
            <Line type="monotone" dataKey="y" stroke="#4FD1C5" strokeWidth={2} dot={false} name="مسیر" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title="موقعیت برحسب زمان">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="t" stroke="#A0AEC0" name="زمان" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
            <Legend />
            <Line type="monotone" dataKey="x" stroke="#4FD1C5" dot={false} name="موقعیت x" />
            <Line type="monotone" dataKey="y" stroke="#F6AD55" dot={false} name="موقعیت y" />
            {has3DPosition && <Line type="monotone" dataKey="z" stroke="#B794F4" dot={false} name="موقعیت z" />}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title="سرعت برحسب زمان">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="t" stroke="#A0AEC0" name="زمان" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
            <Legend />
            <Line type="monotone" dataKey="vx" stroke="#4FD1C5" dot={false} name="سرعت vx" />
            <Line type="monotone" dataKey="vy" stroke="#F6AD55" dot={false} name="سرعت vy" />
            {has3DVelocity && <Line type="monotone" dataKey="vz" stroke="#B794F4" dot={false} name="سرعت vz" />}
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
      
      {hasEnergy && (
         <ChartWrapper title="انرژی برحسب زمان">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plotData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="t" stroke="#A0AEC0" name="زمان" />
                <YAxis type="number" domain={['dataMin - 0.1 * abs(dataMin)', 'dataMax + 0.1 * abs(dataMax)']} stroke="#A0AEC0" allowDataOverflow />
                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#B794F4" dot={false} name="انرژی کل" />
              </LineChart>
            </ResponsiveContainer>
        </ChartWrapper>
      )}

      {hasMomentum && (
         <ChartWrapper title="تکانه برحسب زمان">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plotData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="t" stroke="#A0AEC0" name="زمان" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                <Legend />
                <Line type="monotone" dataKey="px" stroke="#4FD1C5" dot={false} name="تکانه px" />
                <Line type="monotone" dataKey="py" stroke="#F6AD55" dot={false} name="تکانه py" />
                {has3DMomentum && <Line type="monotone" dataKey="pz" stroke="#B794F4" dot={false} name="تکانه pz" />}
              </LineChart>
            </ResponsiveContainer>
        </ChartWrapper>
      )}

    </div>
  );
};
