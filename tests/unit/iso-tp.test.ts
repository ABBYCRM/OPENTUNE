import { describe, it, expect } from 'vitest';
import {
  encodeSingleFrame, encodeFirstFrame, encodeConsecutiveFrame, encodeFlowFrame,
  decodeFrame, ISO_TP_PCI_TYPE, CAN_FRAME_MAX
} from '../../src/shared/protocols/iso-tp';

describe('ISO-TP', () => {
  it('encodes single frame', () => {
    const sf = encodeSingleFrame([0x01, 0x02, 0x03]);
    expect(sf[0]).toBe(ISO_TP_PCI_TYPE.SINGLE << 4 | 3);
    expect(sf.slice(1)).toEqual([0x01, 0x02, 0x03]);
  });

  it('encodes first frame with length', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const ff = encodeFirstFrame(data);
    const totalLen = ((ff[0] & 0x0f) << 8) | ff[1];
    expect(totalLen).toBe(data.length);
    expect(ff.length).toBe(CAN_FRAME_MAX);
  });

  it('encodes consecutive frame with sequence number', () => {
    const cf = encodeConsecutiveFrame([1, 2, 3, 4, 5, 6, 7], 5);
    expect((cf[0] >> 4) & 0x0f).toBe(ISO_TP_PCI_TYPE.CONSECUTIVE);
    expect(cf[0] & 0x0f).toBe(5);
  });

  it('encodes flow frame', () => {
    const fc = encodeFlowFrame(0, 0, 0);
    expect((fc[0] >> 4) & 0x0f).toBe(ISO_TP_PCI_TYPE.FLOW);
    expect(fc.length).toBe(CAN_FRAME_MAX);
  });

  it('decodes single frame', () => {
    const f = decodeFrame([0x03, 0xAA, 0xBB]);
    expect(f.pciType).toBe(ISO_TP_PCI_TYPE.SINGLE);
    expect(f.totalLength).toBe(3);
  });

  it('decodes first frame', () => {
    const f = decodeFrame([0x10, 0x64, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
    expect(f.pciType).toBe(ISO_TP_PCI_TYPE.FIRST);
    expect(f.totalLength).toBe(100);
  });

  it('decodes consecutive frame sequence number', () => {
    const f = decodeFrame([0x21, 0xAA, 0xBB]);
    expect(f.pciType).toBe(ISO_TP_PCI_TYPE.CONSECUTIVE);
    expect(f.sequenceNumber).toBe(1);
  });
});
