/**
 * OPENTUNE — Datalog service
 * Periodically samples PIDs and emits a `sample` event with the data.
 */

import { EventEmitter } from 'events';
import { OBD2Service } from './obd2';
import { MODE_01_PIDS } from '../../shared/protocols/obd2-pids';
import { logger } from '../util/logger';

export interface DatalogSample {
  t: number;          // ms since start
  timestamp: number;  // unix ms
  values: Record<string, number | string>;
}

export interface DatalogStatus {
  running: boolean;
  pids: number[];
  intervalMs: number;
  samples: number;
  startedAt: number | null;
}

export class DatalogService extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private pids: number[] = [];
  private intervalMs = 100;
  private samples: DatalogSample[] = [];
  private startedAt: number | null = null;
  private maxSamples = 10000;

  constructor(private obd2: OBD2Service) {
    super();
  }

  async start(pids: number[], intervalMs: number): Promise<DatalogStatus> {
    if (this.timer) await this.stop();
    this.pids = pids.length > 0 ? pids : [0x0c, 0x0d, 0x05, 0x0b, 0x11];
    this.intervalMs = Math.max(20, Math.min(2000, intervalMs));
    this.samples = [];
    this.startedAt = Date.now();

    const tick = async () => {
      const t = Date.now() - this.startedAt!;
      const values: Record<string, number | string> = {};
      for (const pid of this.pids) {
        try {
          const decoded = await this.obd2.readPidDecoded(pid);
          const def = MODE_01_PIDS[pid];
          if (def) values[def.shortName] = decoded.value;
        } catch (err) {
          // Skip failed PIDs
        }
      }
      const sample: DatalogSample = { t, timestamp: Date.now(), values };
      this.samples.push(sample);
      if (this.samples.length > this.maxSamples) this.samples.shift();
      this.emit('sample', sample);
    };

    this.timer = setInterval(tick, this.intervalMs);
    // Fire one immediately so the UI has data fast
    tick().catch(err => logger.warn('Initial datalog tick failed', err));
    return this.status();
  }

  async stop(): Promise<DatalogStatus> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    return this.status();
  }

  status(): DatalogStatus {
    return {
      running: !!this.timer,
      pids: this.pids,
      intervalMs: this.intervalMs,
      samples: this.samples.length,
      startedAt: this.startedAt,
    };
  }

  snapshot(): DatalogSample[] {
    return this.samples.slice();
  }
}
