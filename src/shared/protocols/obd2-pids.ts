/**
 * OPENTUNE — OBD-II standard PIDs (SAE J1979)
 * Mode 01: Live data
 * Mode 02: Freeze frame
 * Mode 03: Read DTCs
 * Mode 04: Clear DTCs
 * Mode 09: Vehicle info (VIN, calibration ID)
 * Mode 0A: Permanent DTCs
 */

export type ObdMode = 0x01 | 0x02 | 0x03 | 0x04 | 0x09 | 0x0a;

export interface PidDefinition {
  pid: number;
  mode: ObdMode;
  name: string;
  shortName: string;
  unit: string;
  /** Bytes returned (excluding mode + pid) */
  bytes: number;
  /** Convert raw bytes to a scaled value */
  decode: (data: number[]) => number | string;
  /** Optional min/max for graphing */
  min?: number;
  max?: number;
}

// ============== MODE 01 — LIVE DATA ==============

export const MODE_01_PIDS: Record<number, PidDefinition> = {
  0x00: {
    pid: 0x00, mode: 0x01, name: 'PIDs supported 01-20', shortName: 'PIDS_A', unit: 'bitmask',
    bytes: 4, decode: (d) => parseInt(d.map(b => b.toString(16).padStart(2, '0')).join(''), 16),
  },
  0x04: {
    pid: 0x04, mode: 0x01, name: 'Calculated engine load', shortName: 'ENGINE_LOAD', unit: '%',
    bytes: 1, decode: (d) => (d[0] * 100) / 255, min: 0, max: 100,
  },
  0x05: {
    pid: 0x05, mode: 0x01, name: 'Engine coolant temperature', shortName: 'ECT', unit: '°C',
    bytes: 1, decode: (d) => d[0] - 40, min: -40, max: 215,
  },
  0x06: {
    pid: 0x06, mode: 0x01, name: 'Short term fuel trim — Bank 1', shortName: 'STFT_B1', unit: '%',
    bytes: 1, decode: (d) => (d[0] - 128) * (100 / 128), min: -100, max: 99.2,
  },
  0x07: {
    pid: 0x07, mode: 0x01, name: 'Long term fuel trim — Bank 1', shortName: 'LTFT_B1', unit: '%',
    bytes: 1, decode: (d) => (d[0] - 128) * (100 / 128), min: -100, max: 99.2,
  },
  0x08: {
    pid: 0x08, mode: 0x01, name: 'Short term fuel trim — Bank 2', shortName: 'STFT_B2', unit: '%',
    bytes: 1, decode: (d) => (d[0] - 128) * (100 / 128), min: -100, max: 99.2,
  },
  0x09: {
    pid: 0x09, mode: 0x01, name: 'Long term fuel trim — Bank 2', shortName: 'LTFT_B2', unit: '%',
    bytes: 1, decode: (d) => (d[0] - 128) * (100 / 128), min: -100, max: 99.2,
  },
  0x0b: {
    pid: 0x0b, mode: 0x01, name: 'Intake manifold absolute pressure', shortName: 'MAP', unit: 'kPa',
    bytes: 1, decode: (d) => d[0], min: 0, max: 255,
  },
  0x0c: {
    pid: 0x0c, mode: 0x01, name: 'Engine RPM', shortName: 'RPM', unit: 'rpm',
    bytes: 2, decode: (d) => (d[0] * 256 + d[1]) / 4, min: 0, max: 16383.75,
  },
  0x0d: {
    pid: 0x0d, mode: 0x01, name: 'Vehicle speed', shortName: 'SPEED', unit: 'km/h',
    bytes: 1, decode: (d) => d[0], min: 0, max: 255,
  },
  0x0e: {
    pid: 0x0e, mode: 0x01, name: 'Timing advance', shortName: 'TIMING', unit: '°',
    bytes: 1, decode: (d) => (d[0] - 128) / 2, min: -64, max: 63.5,
  },
  0x0f: {
    pid: 0x0f, mode: 0x01, name: 'Intake air temperature', shortName: 'IAT', unit: '°C',
    bytes: 1, decode: (d) => d[0] - 40, min: -40, max: 215,
  },
  0x10: {
    pid: 0x10, mode: 0x01, name: 'MAF air flow rate', shortName: 'MAF', unit: 'g/s',
    bytes: 2, decode: (d) => (d[0] * 256 + d[1]) / 100, min: 0, max: 655.35,
  },
  0x11: {
    pid: 0x11, mode: 0x01, name: 'Throttle position', shortName: 'TPS', unit: '%',
    bytes: 1, decode: (d) => (d[0] * 100) / 255, min: 0, max: 100,
  },
  0x1f: {
    pid: 0x1f, mode: 0x01, name: 'Run time since engine start', shortName: 'RUNTIME', unit: 's',
    bytes: 2, decode: (d) => d[0] * 256 + d[1], min: 0, max: 65535,
  },
  0x21: {
    pid: 0x21, mode: 0x01, name: 'Distance traveled with MIL on', shortName: 'DTC_DIST', unit: 'km',
    bytes: 2, decode: (d) => d[0] * 256 + d[1], min: 0, max: 65535,
  },
  0x2f: {
    pid: 0x2f, mode: 0x01, name: 'Fuel level', shortName: 'FUEL_LEVEL', unit: '%',
    bytes: 1, decode: (d) => (d[0] * 100) / 255, min: 0, max: 100,
  },
  0x33: {
    pid: 0x33, mode: 0x01, name: 'Barometric pressure', shortName: 'BARO', unit: 'kPa',
    bytes: 1, decode: (d) => d[0], min: 0, max: 255,
  },
  0x42: {
    pid: 0x42, mode: 0x01, name: 'Control module voltage', shortName: 'VBATT', unit: 'V',
    bytes: 2, decode: (d) => (d[0] * 256 + d[1]) / 1000, min: 0, max: 65.535,
  },
  0x46: {
    pid: 0x46, mode: 0x01, name: 'Ambient air temperature', shortName: 'AAT', unit: '°C',
    bytes: 1, decode: (d) => d[0] - 40, min: -40, max: 215,
  },
  0x5a: {
    pid: 0x5a, mode: 0x01, name: 'Relative accelerator pedal position', shortName: 'APP', unit: '%',
    bytes: 1, decode: (d) => (d[0] * 100) / 255, min: 0, max: 100,
  },
  0x5c: {
    pid: 0x5c, mode: 0x01, name: 'Engine oil temperature', shortName: 'EOT', unit: '°C',
    bytes: 1, decode: (d) => d[0] - 40, min: -40, max: 210,
  },
};

/** Decodes standard OBD-II DTC into human-readable string */
export function decodeDtc(rawByte: number, position: number): string {
  const firstNibble = (rawByte >> 6) & 0x03;
  const secondNibble = (rawByte >> 4) & 0x03;
  const thirdNibble = (rawByte >> 2) & 0x03;
  const fourthNibble = rawByte & 0x03;

  const prefix = ['P', 'C', 'B', 'U'][firstNibble];
  const secondDigit = secondNibble.toString(16).toUpperCase();
  const thirdDigit = [thirdNibble, 0, 1, 2][thirdNibble]?.toString() ?? thirdNibble.toString();
  const fourthDigit = fourthNibble.toString(16).toUpperCase();

  return `${prefix}${secondDigit}${thirdDigit}${fourthDigit}`;
}

export function decodeDtcResponse(payload: number[]): string[] {
  const dtcs: string[] = [];
  for (let i = 0; i < payload.length; i += 2) {
    const a = payload[i];
    const b = payload[i + 1] ?? 0;
    if (a === 0 && b === 0) continue;
    dtcs.push(decodeDtc(a, 0) + decodeDtc(b, 1));
  }
  // Note: OBD-II DTCs are 2 bytes each, decoded as P-C-B-U + 3 hex digits
  const codes: string[] = [];
  for (let i = 0; i < payload.length; i += 2) {
    const a = payload[i];
    const b = payload[i + 1] ?? 0;
    if (a === 0 && b === 0) continue;
    const prefix = ['P', 'C', 'B', 'U'][(a >> 6) & 0x03];
    const d1 = ((a >> 4) & 0x03).toString(16).toUpperCase();
    const d2 = (a & 0x0f).toString(16).toUpperCase();
    const d3 = ((b >> 4) & 0x0f).toString(16).toUpperCase();
    const d4 = (b & 0x0f).toString(16).toUpperCase();
    codes.push(`${prefix}${d1}${d2}${d3}${d4}`);
  }
  return codes;
}
