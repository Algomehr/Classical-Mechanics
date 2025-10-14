
export interface Parameter {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface Solution {
  explanation: string;
  numericalCode: string;
  simulationCode: string;
  simulationCode3D?: string;
  parameters: Parameter[];
}

export interface PlotDataPoint {
  t: number;
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  vz?: number;
  [key: string]: number | undefined; // Allow for other properties like energy and optional z/vz
}