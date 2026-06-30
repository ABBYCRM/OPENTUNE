import { describe, it, expect } from 'vitest';
import { buildObdRequest, parseElmResponse } from '../../src/shared/protocols/elm327';

describe('ELM327 protocol', () => {
  it('builds OBD request string', () => {
    expect(buildObdRequest(0x01, 0x0c)).toBe('010C');
    expect(buildObdRequest(0x03, 0x00)).toBe('0300');
  });

  it('parses a normal CAN response with header', () => {
    const r = parseElmResponse('7E8 04 41 0C 1A F8');
    expect(r.header).toBe('7E8');
    expect(r.data).toEqual([0x04, 0x41, 0x0c, 0x1a, 0xf8]);
    expect(r.ok).toBe(true);
  });

  it('parses response without header (11-bit CAN legacy)', () => {
    const r = parseElmResponse('41 0C 1A F8');
    expect(r.header).toBeUndefined();
    expect(r.data).toEqual([0x41, 0x0c, 0x1a, 0xf8]);
  });

  it('returns ok=false on NO DATA', () => {
    const r = parseElmResponse('NO DATA');
    expect(r.ok).toBe(false);
  });

  it('returns ok=false on ERROR', () => {
    const r = parseElmResponse('ERROR');
    expect(r.ok).toBe(false);
  });
});
