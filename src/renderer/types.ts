/**
 * OPENTUNE — Renderer-side TypeScript types for the preload bridge.
 */

export type Transport = 'elm327' | 'elm327-bt' | 'opentune-hw' | 'j2534' | 'simulator';

export interface DeviceInfo {
  path: string;
  manufacturer?: string;
  productId?: string;
  vendorId?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  transport: Transport | null;
  device: string | null;
  protocol: string | null;
}

export interface PidValue {
  pid: number;
  mode: number;
  name: string;
  shortName: string;
  unit: string;
  value: number | string;
  raw: number[];
  timestamp: number;
  min?: number;
  max?: number;
}

export interface MapAxis {
  name: string;
  type: string;
  unit: string;
  values: number[];
}

export interface MapTable {
  id: string;
  name: string;
  category: string;
  xAxis: MapAxis;
  yAxis: MapAxis;
  data: number[];
  unit: string;
  scale: number;
  offset: number;
  min: number;
  max: number;
  description: string;
}

export interface DatalogSample {
  t: number;
  timestamp: number;
  values: Record<string, number | string>;
}

export interface DatalogStatus {
  running: boolean;
  pids: number[];
  intervalMs: number;
  samples: number;
  startedAt: number | null;
}

export interface OpentuneAPI {
  hardware: {
    list: () => Promise<DeviceInfo[]>;
    connect: (transport: string, device: string) => Promise<ConnectionStatus>;
    disconnect: () => Promise<void>;
    status: () => Promise<ConnectionStatus>;
  };
  obd2: {
    readPid: (mode: number, pid: number) => Promise<{ raw: string; data: number[]; header?: string; ok: boolean }>;
    readDtcs: () => Promise<string[]>;
    clearDtcs: () => Promise<boolean>;
    vin: () => Promise<string>;
    supportedPids: () => Promise<PidValue[]>;
  };
  maps: {
    list: () => Promise<MapTable[]>;
    get: (id: string) => Promise<MapTable | null>;
    updateCell: (id: string, row: number, col: number, value: number) => Promise<MapTable | null>;
    save: (id: string) => Promise<boolean>;
    export: (id: string) => Promise<boolean | null>;
    import: () => Promise<MapTable | null>;
  };
  datalog: {
    start: (pids: number[], intervalMs: number) => Promise<DatalogStatus>;
    stop: () => Promise<DatalogStatus>;
    status: () => Promise<DatalogStatus>;
    snapshot: () => Promise<DatalogSample[]>;
    onSample: (cb: (sample: DatalogSample) => void) => () => void;
  };
}

declare global {
  interface Window {
    opentune: OpentuneAPI;
  }
}
