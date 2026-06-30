/**
 * OPENTUNE — ELM327 AT command protocol
 * Reference: ELM327 datasheet v2.3
 *
 * Public, well-documented chip — no proprietary data. Commands are
 * open AT-style ASCII strings.
 */

export const ELM327_INIT_SEQUENCE = [
  'ATZ',         // reset
  'ATE0',        // echo off
  'ATL0',        // line feeds off
  'ATS0',        // spaces off
  'ATH0',        // headers off
  'ATSP0',       // auto protocol
  'ATDPN',       // describe protocol by number
];

export interface ElmCommandResult {
  raw: string;
  /** Response data bytes (hex) without the header */
  data: number[];
  /** Frame-type echo from the ELM327 (e.g. "7E8") */
  header?: string;
  /** True if ECU responded with a positive acknowledgement */
  ok: boolean;
}

/**
 * Build an OBD-II request string for the ELM327.
 * Mode 01 PID 0C (RPM) → "010C"
 */
export function buildObdRequest(mode: number, pid: number, extra: number[] = []): string {
  const bytes = [mode, pid, ...extra];
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

/**
 * Parse an ELM327 ASCII response.
 * Format: <HEADER?> <HEXBYTES...>
 * Example: "7E8 0C 1A F8" → header=7E8, data=[0x0C, 0x1A, 0xF8]
 */
export function parseElmResponse(raw: string): ElmCommandResult {
  const trimmed = raw.trim();
  const ok = !/^(NO DATA|ERROR|UNABLE TO CONNECT|BUS INIT|STOPPED|FB ERROR|SERIOUS ERROR|\?)/i.test(trimmed);
  if (!ok) return { raw: trimmed, data: [], ok: false };

  const tokens = trimmed.split(/\s+/);
  let header: string | undefined;
  let dataStart = 0;

  // First token is the header if it looks like a CAN ID (3 hex chars, no '?' chars)
  if (tokens.length > 0 && /^[0-9A-F]{3}$/.test(tokens[0])) {
    header = tokens[0];
    dataStart = 1;
  }

  const data = tokens
    .slice(dataStart)
    .filter(t => /^[0-9A-F]{2}$/i.test(t))
    .map(t => parseInt(t, 16));

  return { raw: trimmed, data, header, ok: true };
}
