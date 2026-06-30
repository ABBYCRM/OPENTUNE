/**
 * OPENTUNE — Map (calibration table) service
 * Holds the in-memory map definitions and provides CRUD + persistence.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { MapTable, SAMPLE_MAPS } from '../../shared/maps/map-types';
import { logger } from '../util/logger';

export class MapService {
  private maps: Map<string, MapTable> = new Map();
  private dirty: Set<string> = new Set();
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(app.getPath('userData'), 'maps');
    fs.mkdir(this.storageDir, { recursive: true }).catch(() => {});
    this.loadDefaults();
  }

  private loadDefaults() {
    for (const map of SAMPLE_MAPS) {
      this.maps.set(map.id, JSON.parse(JSON.stringify(map)));
    }
    logger.info(`Loaded ${this.maps.size} default maps`);
  }

  list(): MapTable[] {
    return Array.from(this.maps.values());
  }

  get(id: string): MapTable | null {
    return this.maps.get(id) ?? null;
  }

  updateCell(id: string, row: number, col: number, value: number): MapTable | null {
    const map = this.maps.get(id);
    if (!map) return null;
    const cols = map.yAxis.values.length;
    const idx = row * cols + col;
    if (idx < 0 || idx >= map.data.length) {
      throw new Error(`Cell (${row},${col}) out of range`);
    }
    value = Math.max(map.min, Math.min(map.max, value));
    map.data[idx] = value;
    this.dirty.add(id);
    return map;
  }

  async save(id: string): Promise<boolean> {
    const map = this.maps.get(id);
    if (!map) return false;
    const file = path.join(this.storageDir, `${id}.opentune.json`);
    try {
      await fs.writeFile(file, JSON.stringify(map, null, 2), 'utf8');
      this.dirty.delete(id);
      logger.info(`Saved map ${id} to ${file}`);
      return true;
    } catch (err) {
      logger.error(`Failed to save map ${id}`, err);
      return false;
    }
  }

  async exportToFile(id: string, filePath: string): Promise<boolean> {
    const map = this.maps.get(id);
    if (!map) return false;
    try {
      await fs.writeFile(filePath, JSON.stringify(map, null, 2), 'utf8');
      return true;
    } catch (err) {
      logger.error(`Failed to export map ${id}`, err);
      return false;
    }
  }

  async importFromFile(filePath: string): Promise<MapTable | null> {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const map = JSON.parse(raw) as MapTable;
      if (!map.id || !map.data || !Array.isArray(map.data)) {
        throw new Error('Invalid map file');
      }
      this.maps.set(map.id, map);
      return map;
    } catch (err) {
      logger.error(`Failed to import map from ${filePath}`, err);
      return null;
    }
  }
}
