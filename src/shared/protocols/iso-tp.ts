/**
 * OPENTUNE — ISO-TP (ISO 15765-2) framing for multi-frame UDS messages.
 * Reference: ISO 15765-2:2016
 *
 * Public ISO standard — implementation derived from spec, no proprietary data.
 */

export const ISO_TP_PCI_TYPE = {
  SINGLE: 0x0,
  FIRST: 0x1,
  CONSECUTIVE: 0x2,
  FLOW: 0x3,
} as const;

export interface IsoTpFrame {
  /** Full CAN frame payload (≤ 8 bytes for classic CAN) */
  payload: number[];
  /** Decoded PCI type */
  pciType: number;
  /** Total message length (FIRST frame only) */
  totalLength?: number;
  /** Consecutive frame sequence number (0-15) */
  sequenceNumber?: number;
  /** Flow status (FLOW frame only) */
  flowStatus?: number;
}

export function encodeSingleFrame(data: number[]): number[] {
  const len = data.length;
  return [ISO_TP_PCI_TYPE.SINGLE << 4 | (len & 0x0f), ...data];
}

export function encodeFirstFrame(data: number[]): number[] {
  const total = data.length;
  const hi = (total >> 8) & 0x0f;
  const lo = total & 0xff;
  return [(ISO_TP_PCI_TYPE.FIRST << 4) | hi, lo, ...data.slice(0, 6)];
}

export function encodeConsecutiveFrame(data: number[], sn: number): number[] {
  const snByte = (ISO_TP_PCI_TYPE.CONSECUTIVE << 4) | (sn & 0x0f);
  return [snByte, ...data.slice(0, 7)];
}

export function encodeFlowFrame(status: number = 0, blockSize: number = 0, separationTime: number = 0): number[] {
  return [
    (ISO_TP_PCI_TYPE.FLOW << 4) | (status & 0x0f),
    blockSize & 0xff,
    separationTime & 0xff,
    0x00, 0x00, 0x00, 0x00, 0x00,
  ];
}

export function decodeFrame(payload: number[]): IsoTpFrame {
  if (payload.length < 1) {
    return { payload, pciType: -1 };
  }
  const pciType = (payload[0] >> 4) & 0x0f;
  switch (pciType) {
    case ISO_TP_PCI_TYPE.SINGLE: {
      const len = payload[0] & 0x0f;
      return { payload, pciType, totalLength: len };
    }
    case ISO_TP_PCI_TYPE.FIRST: {
      const totalLength = ((payload[0] & 0x0f) << 8) | payload[1];
      return { payload, pciType, totalLength };
    }
    case ISO_TP_PCI_TYPE.CONSECUTIVE: {
      const sequenceNumber = payload[0] & 0x0f;
      return { payload, pciType, sequenceNumber };
    }
    case ISO_TP_PCI_TYPE.FLOW: {
      const flowStatus = payload[0] & 0x0f;
      return { payload, pciType, flowStatus };
    }
    default:
      return { payload, pciType };
  }
}

/** Maximum classic CAN data per frame is 8 bytes (7 for first frame). */
export const CAN_FRAME_MAX = 8;
