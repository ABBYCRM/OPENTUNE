/**
 * OPENTUNE — Map definition (table) model.
 * Inspired by RomRaider's XDF model and HP Tuners' VCM table structure.
 * Public specification of the data model — no proprietary definition files used.
 */

export type AxisType = 'RPM' | 'MAP' | 'TPS' | 'MAF' | 'IAT' | 'ECT' | 'TIMING' | 'CUSTOM';

export interface MapAxis {
  name: string;
  type: AxisType;
  unit: string;
  values: number[];
}

export interface MapTable {
  id: string;
  name: string;
  category: 'fuel' | 'ignition' | 'boost' | 'idle' | 'sensor' | 'trans' | 'other';
  /** Vertical axis (rows) — typically RPM */
  xAxis: MapAxis;
  /** Horizontal axis (columns) — typically MAP/kPa or TPS/% */
  yAxis: MapAxis;
  /** Cell values, row-major: data[row * cols + col] */
  data: number[];
  unit: string;
  scale: number;       // multiplier for storage (e.g. 0.1 means raw*10)
  offset: number;
  min: number;
  max: number;
  description: string;
}

export const SAMPLE_MAPS: MapTable[] = [
  {
    id: 'fuel_ve_main',
    name: 'Volumetric Efficiency (Main Fuel Table)',
    category: 'fuel',
    xAxis: {
      name: 'Engine Speed',
      type: 'RPM',
      unit: 'rpm',
      values: [800, 1200, 1600, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
    },
    yAxis: {
      name: 'Manifold Absolute Pressure',
      type: 'MAP',
      unit: 'kPa',
      values: [20, 30, 40, 50, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240],
    },
    data: [
      42, 45, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 87, 89,
      48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 87, 89, 90, 91,
      54, 58, 62, 66, 70, 74, 78, 82, 85, 87, 89, 91, 92, 93,
      60, 64, 68, 72, 76, 80, 84, 86, 88, 90, 92, 93, 94, 95,
      66, 70, 74, 78, 82, 85, 87, 89, 91, 92, 94, 95, 96, 97,
      72, 76, 80, 84, 86, 88, 90, 92, 93, 95, 96, 97, 98, 98,
      78, 82, 85, 87, 89, 91, 93, 94, 96, 97, 98, 99, 99, 99,
      82, 85, 87, 89, 91, 93, 95, 96, 97, 98, 99, 99, 99, 99,
      84, 86, 88, 90, 92, 94, 96, 97, 98, 99, 99, 99, 99, 99,
      85, 87, 89, 91, 93, 95, 97, 98, 99, 99, 99, 99, 99, 99,
      86, 88, 90, 92, 94, 96, 97, 98, 99, 99, 99, 99, 99, 99,
      86, 88, 90, 92, 94, 96, 97, 98, 99, 99, 99, 99, 99, 99,
      85, 87, 89, 91, 93, 95, 96, 97, 98, 99, 99, 99, 99, 99,
      84, 86, 88, 90, 92, 94, 95, 96, 97, 98, 99, 99, 99, 99,
    ],
    unit: '%',
    scale: 1,
    offset: 0,
    min: 0,
    max: 120,
    description: 'Main volumetric efficiency table — primary fuel map for speed-density fueling.',
  },
  {
    id: 'ign_timing_main',
    name: 'Base Ignition Timing (degrees BTDC)',
    category: 'ignition',
    xAxis: {
      name: 'Engine Speed',
      type: 'RPM',
      unit: 'rpm',
      values: [800, 1200, 1600, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
    },
    yAxis: {
      name: 'Manifold Absolute Pressure',
      type: 'MAP',
      unit: 'kPa',
      values: [20, 30, 40, 50, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240],
    },
    data: [
      12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 33, 34, 35,
      14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 35, 36, 37,
      16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 35, 36, 37, 38,
      18, 20, 22, 24, 26, 28, 30, 32, 34, 35, 36, 37, 38, 38,
      20, 22, 24, 26, 28, 30, 32, 33, 35, 36, 37, 38, 38, 38,
      22, 24, 26, 28, 30, 32, 33, 34, 35, 36, 37, 37, 37, 37,
      24, 26, 28, 30, 31, 32, 33, 34, 35, 36, 36, 36, 36, 36,
      25, 27, 29, 30, 31, 32, 33, 34, 34, 35, 35, 35, 35, 35,
      26, 28, 29, 30, 31, 32, 33, 33, 34, 34, 34, 34, 34, 34,
      26, 28, 29, 30, 31, 32, 32, 33, 33, 33, 33, 33, 33, 33,
      26, 27, 28, 29, 30, 31, 31, 32, 32, 32, 32, 32, 32, 32,
      25, 26, 27, 28, 29, 30, 30, 31, 31, 31, 31, 31, 31, 31,
      24, 25, 26, 27, 28, 29, 29, 30, 30, 30, 30, 30, 30, 30,
      22, 23, 24, 25, 26, 27, 27, 28, 28, 28, 28, 28, 28, 28,
    ],
    unit: '°BTDC',
    scale: 1,
    offset: 0,
    min: -10,
    max: 60,
    description: 'Base ignition timing — advance in degrees before top dead center.',
  },
  {
    id: 'boost_target',
    name: 'Boost Target (MAP-based)',
    category: 'boost',
    xAxis: {
      name: 'Engine Speed',
      type: 'RPM',
      unit: 'rpm',
      values: [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
    },
    yAxis: {
      name: 'Gear',
      type: 'CUSTOM',
      unit: 'gear',
      values: [1, 2, 3, 4, 5, 6],
    },
    data: [
      140, 150, 160, 170, 180, 190, 195, 200, 200, 200, 200, 200,
      150, 165, 180, 190, 200, 210, 215, 220, 220, 220, 220, 220,
      160, 180, 200, 215, 225, 235, 240, 245, 245, 245, 245, 245,
      170, 190, 215, 230, 240, 250, 255, 260, 260, 260, 260, 260,
      180, 200, 225, 240, 250, 260, 265, 270, 270, 270, 270, 270,
      180, 200, 225, 240, 250, 260, 265, 270, 270, 270, 270, 270,
    ],
    unit: 'kPa',
    scale: 1,
    offset: 0,
    min: 100,
    max: 300,
    description: 'Per-gear target boost pressure.',
  },
];
