/**
 * OPENTUNE — Hardware abstraction layer
 * Manages the active transport (ELM327 over serial/BT, J2534, or custom OpenTune HW)
 */

import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';
import { ELM327_INIT_SEQUENCE, buildObdRequest, parseElmResponse } from '../../shared/protocols/elm327';
import { logger } from '../util/logger';

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
  voltage?: number;
}

export class HardwareManager extends EventEmitter {
  private port: SerialPort | null = null;
  private transport: Transport | null = null;
  private device: string | null = null;
  private protocol: string | null = null;
  private simMode = false;

  /** Enumerate all serial/USB devices */
  async listDevices(): Promise<DeviceInfo[]> {
    try {
      const ports = await SerialPort.list();
      return ports.map(p => ({
        path: p.path,
        manufacturer: p.manufacturer,
        productId: p.productId,
        vendorId: p.vendorId,
      }));
    } catch (err) {
      logger.warn('Failed to enumerate serial ports', err);
      return [];
    }
  }

  async connect(transport: string, device: string): Promise<ConnectionStatus> {
    await this.disconnect();

    if (transport === 'simulator') {
      this.simMode = true;
      this.transport = 'simulator';
      this.device = 'simulator://internal';
      this.protocol = 'SIM';
      logger.info('Connected in SIMULATOR mode (no real hardware)');
      return this.status();
    }

    const baud = transport === 'opentune-hw' ? 921600 : 38400;
    return new Promise((resolve, reject) => {
      try {
        this.port = new SerialPort({ path: device, baudRate: baud, autoOpen: false });

        this.port.open((err) => {
          if (err) {
            logger.error('Failed to open port', err);
            return reject(err);
          }
          this.transport = transport as Transport;
          this.device = device;
          logger.info(`Port ${device} open @ ${baud} baud`);

          this.initializeElm()
            .then(() => resolve(this.status()))
            .catch(reject);
        });

        this.port.on('data', (chunk) => this.handleData(chunk));
        this.port.on('error', (err) => logger.error('Serial error', err));
        this.port.on('close', () => {
          logger.info('Serial port closed');
          this.transport = null;
          this.device = null;
          this.emit('disconnect');
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.simMode) {
      this.simMode = false;
      this.transport = null;
      this.device = null;
      return;
    }
    if (this.port?.isOpen) {
      await new Promise<void>((resolve) => this.port!.close(() => resolve()));
    }
    this.port = null;
    this.transport = null;
    this.device = null;
  }

  status(): ConnectionStatus {
    return {
      connected: !!this.transport,
      transport: this.transport,
      device: this.device,
      protocol: this.protocol,
    };
  }

  /** Send a raw request and wait for a response. */
  async send(request: string, timeoutMs = 2000): Promise<string> {
    if (this.simMode) return this.simulateResponse(request);
    if (!this.port?.isOpen) throw new Error('No device connected');

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
      const onData = (chunk: Buffer) => {
        clearTimeout(timer);
        this.port!.off('data', onData);
        resolve(chunk.toString('utf8').trim());
      };
      this.port!.once('data', onData);
      this.port!.write(`${request}\r`);
    });
  }

  private buffer = '';
  private pendingResolvers: Array<(data: string) => void> = [];

  private handleData(chunk: Buffer) {
    this.buffer += chunk.toString('utf8');
    if (this.buffer.includes('>')) {
      const complete = this.buffer;
      this.buffer = '';
      const resolver = this.pendingResolvers.shift();
      if (resolver) resolver(complete.replace('>', '').trim());
    }
  }

  private async initializeElm(): Promise<void> {
    for (const cmd of ELM327_INIT_SEQUENCE) {
      try {
        const resp = await this.send(cmd, 3000);
        logger.debug(`ELM327 [${cmd}] → ${resp}`);
        if (cmd === 'ATDPN') this.protocol = resp;
      } catch (err) {
        logger.warn(`ELM327 init command ${cmd} failed`, err);
      }
    }
  }

  /** Simulate a believable ECU response for dev/CI. */
  private simulateResponse(request: string): string {
    const upper = request.toUpperCase().trim();
    if (upper === 'ATZ') return 'ELM327 SIM v2.3';
    if (upper === 'ATDPN') return '6';  // ISO 15765-4 CAN
    if (upper === '0902') return '7E8 02 01 00 00 00 31';  // VIN frame
    if (upper === '0100') return '7E8 06 41 00 BE 1F B8 11'; // supported PIDs
    if (upper === '010C') {
      const rpm = 800 + Math.floor(Math.random() * 3000);
      const a = Math.floor((rpm * 4) / 256);
      const b = (rpm * 4) % 256;
      return `7E8 04 41 0C ${a.toString(16).toUpperCase()} ${b.toString(16).toUpperCase()}`;
    }
    if (upper === '010D') {
      const v = Math.floor(Math.random() * 80);
      return `7E8 03 41 0D ${v.toString(16).toUpperCase()}`;
    }
    if (upper === '0105') {
      const t = 80 + Math.floor(Math.random() * 20);
      return `7E8 03 41 05 ${(t + 40).toString(16).toUpperCase()}`;
    }
    if (upper === '010B') {
      const map = 30 + Math.floor(Math.random() * 90);
      return `7E8 03 41 0B ${map.toString(16).toUpperCase()}`;
    }
    if (upper === '0111') {
      const tps = 5 + Math.floor(Math.random() * 30);
      return `7E8 03 41 11 ${Math.floor(tps * 2.55).toString(16).toUpperCase()}`;
    }
    if (upper === '03') return '7E8 02 43 00 00 00 00';
    if (upper === '04') return '7E8 01 44';
    return '7E8 00';
  }
}
