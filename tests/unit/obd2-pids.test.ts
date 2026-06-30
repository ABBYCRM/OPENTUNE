import { describe, it, expect } from 'vitest';
import { decodeDtcResponse, MODE_01_PIDS } from '../../src/shared/protocols/obd2-pids';

describe('OBD-II PIDs', () => {
  it('decodes RPM correctly', () => {
    const def = MODE_01_PIDS[0x0c];
    // 0x1A 0xF8 = 6904 → /4 = 1726 rpm
    expect(def.decode([0x1a, 0xf8])).toBeCloseTo(1726, 0);
  });

  it('decodes engine load percentage', () => {
    const def = MODE_01_PIDS[0x04];
    expect(def.decode([0x80])).toBeCloseTo(50.196, 2);
  });

  it('decodes coolant temp', () => {
    const def = MODE_01_PIDS[0x05];
    // raw 0x6B = 107, formula: 107 - 40 = 67°C
    expect(def.decode([0x6b])).toBe(67);
  });

  it('decodes STFT/LTFT', () => {
    const def = MODE_01_PIDS[0x06];
    // raw 0x80 = 128, formula: (128-128) * 100/128 = 0%
    expect(def.decode([0x80])).toBeCloseTo(0, 1);
    // raw 0xA0 = 160, formula: (160-128) * 100/128 = 25%
    expect(def.decode([0xa0])).toBeCloseTo(25, 1);
  });

  it('decodes DTCs', () => {
    // 0x01 0x03 0x00 0x00 → P0103 (mass air flow sensor high)
    const codes = decodeDtcResponse([0x01, 0x03]);
    expect(codes).toContain('P0103');
  });

  it('decodes multiple DTCs', () => {
    // P0171 (system too lean B1) + P0300 (random misfire)
    const codes = decodeDtcResponse([0x01, 0x71, 0x03, 0x00]);
    expect(codes).toContain('P0171');
    expect(codes).toContain('P0300');
  });

  it('ignores zero-padded DTCs', () => {
    const codes = decodeDtcResponse([0x00, 0x00, 0x01, 0x03]);
    expect(codes).toEqual(['P0103']);
  });
});
