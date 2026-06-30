/**
 * OPENTUNE — OBD-II service
 * High-level API: read PIDs, DTCs, VIN over the hardware layer.
 */

import { HardwareManager } from '../hardware/manager';
import { buildObdRequest, parseElmResponse, ElmCommandResult } from '../../shared/protocols/elm327';
import { MODE_01_PIDS, PidDefinition, decodeDtcResponse } from '../../shared/protocols/obd2-pids';
import { logger } from '../util/logger';

export class OBD2Service {
  constructor(private hw: HardwareManager) {}

  async readPid(mode: number, pid: number): Promise<ElmCommandResult> {
    const req = buildObdRequest(mode, pid);
    const resp = await this.hw.send(req);
    const parsed = parseElmResponse(resp);
    if (!parsed.ok) {
      throw new Error(`ECU did not respond: ${parsed.raw}`);
    }
    return parsed;
  }

  async readPidDecoded(pid: number) {
    const def = MODE_01_PIDS[pid];
    if (!def) throw new Error(`Unknown PID 0x${pid.toString(16)}`);

    const resp = await this.readPid(0x01, pid);
    // Strip mode + pid echo (e.g. "41 0C 1A F8" → data=[0x1A, 0xF8])
    const payload = resp.data.slice(2);
    const value = def.decode(payload);

    return {
      ...def,
      value,
      raw: resp.data,
      timestamp: Date.now(),
    };
  }

  async readDtcs(): Promise<string[]> {
    const resp = await this.readPid(0x03, 0x00);
    return decodeDtcResponse(resp.data.slice(1));
  }

  async clearDtcs(): Promise<boolean> {
    try {
      await this.hw.send('04');
      return true;
    } catch (err) {
      logger.error('Failed to clear DTCs', err);
      return false;
    }
  }

  async readVin(): Promise<string> {
    const resp = await this.readPid(0x09, 0x02);
    // Multi-frame VIN decode (Mode 09 PID 02) — simplified
    const data = resp.data.slice(2);
    const ascii = data.map(b => (b >= 0x20 && b < 0x7f) ? String.fromCharCode(b) : '').join('');
    return ascii || 'UNKNOWN';
  }

  async supportedPids(mode: 0x01 | 0x02) {
    const supported: PidDefinition[] = [];
    // PIDs 0x00, 0x20, 0x40, 0x60, 0x80, 0xA0, 0xC0, 0xE0
    for (const pidBase of [0x00, 0x20, 0x40, 0x60, 0x80, 0xa0, 0xc0, 0xe0]) {
      try {
        const resp = await this.readPid(mode, pidBase);
        if (resp.data.length < 6) continue;
        const mask = (resp.data[2] << 24) | (resp.data[3] << 16) | (resp.data[4] << 8) | resp.data[5];
        for (let bit = 0; bit < 32; bit++) {
          if (mask & (1 << (31 - bit))) {
            const pid = pidBase + bit + 1;
            if (MODE_01_PIDS[pid]) supported.push(MODE_01_PIDS[pid]);
          }
        }
        if ((mask & 1) === 0) break;  // no further ranges
      } catch (err) {
        // PID 0x00 may not respond in simulator, fall through
        if (pidBase === 0x00) continue;
        break;
      }
    }
    return supported;
  }
}
