

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
  energy?: number;
  px?: number;
  py?: number;
  pz?: number;
  // Circuit-specific properties
  vc?: number; // Capacitor voltage
  vl?: number; // Inductor voltage
  vr?: number; // Resistor voltage
  [key: string]: number | undefined; // Allow for other properties
}
