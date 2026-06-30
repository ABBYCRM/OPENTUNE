import { describe, it, expect } from 'vitest';
import { SAMPLE_MAPS } from '../../src/shared/maps/map-types';

describe('Map definitions', () => {
  it('sample maps are present', () => {
    expect(SAMPLE_MAPS.length).toBeGreaterThan(0);
  });

  it('every map has matching data size to axes', () => {
    for (const m of SAMPLE_MAPS) {
      const expected = m.xAxis.values.length * m.yAxis.values.length;
      expect(m.data.length).toBe(expected);
    }
  });

  it('every map has positive cell values within range', () => {
    for (const m of SAMPLE_MAPS) {
      for (const v of m.data) {
        expect(v).toBeGreaterThanOrEqual(m.min);
        expect(v).toBeLessThanOrEqual(m.max);
      }
    }
  });

  it('every map has monotonically increasing axis values', () => {
    for (const m of SAMPLE_MAPS) {
      for (let i = 1; i < m.xAxis.values.length; i++) {
        expect(m.xAxis.values[i]).toBeGreaterThan(m.xAxis.values[i - 1]);
      }
      for (let i = 1; i < m.yAxis.values.length; i++) {
        expect(m.yAxis.values[i]).toBeGreaterThan(m.yAxis.values[i - 1]);
      }
    }
  });
});
