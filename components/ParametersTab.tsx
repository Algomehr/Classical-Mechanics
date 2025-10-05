import React from 'react';
import type { Parameter } from '../types';

interface ParametersTabProps {
  parameters: Parameter[];
  paramValues: Record<string, number>;
  onParamChange: (name: string, value: number) => void;
}

export const ParametersTab: React.FC<ParametersTabProps> = ({ parameters, paramValues, onParamChange }) => {
  if (!parameters || parameters.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4">
        پارامترهای تعاملی برای این مسئله تعریف نشده است.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {parameters.map((param) => (
        <div key={param.name} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
          <label htmlFor={param.name} className="font-medium text-gray-300 col-span-1">
            {param.label}
          </label>
          <div className="col-span-1 md:col-span-2 flex items-center gap-3">
             <input
              type="range"
              id={param.name}
              name={param.name}
              min={param.min}
              max={param.max}
              step={param.step}
              value={paramValues[param.name]}
              onChange={(e) => onParamChange(param.name, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <input
              type="number"
              value={paramValues[param.name]}
              min={param.min}
              max={param.max}
              step={param.step}
              onChange={(e) => onParamChange(param.name, parseFloat(e.target.value))}
              className="w-24 bg-gray-900/70 border border-gray-600 rounded-md p-2 text-center text-gray-300 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
