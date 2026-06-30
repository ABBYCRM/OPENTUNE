import React, { useEffect, useState } from 'react';
import { DatalogSample } from '../types';

const WATCH_PIDS: Array<{ pid: number; name: string; short: string; unit: string; min?: number; max?: number; }> = [
  { pid: 0x0c, name: 'Engine RPM', short: 'RPM', unit: 'rpm', min: 0, max: 8000 },
  { pid: 0x0d, name: 'Vehicle Speed', short: 'SPEED', unit: 'km/h', min: 0, max: 260 },
  { pid: 0x05, name: 'Coolant Temp', short: 'ECT', unit: '°C', min: 0, max: 120 },
  { pid: 0x0f, name: 'Intake Air Temp', short: 'IAT', unit: '°C', min: 0, max: 80 },
  { pid: 0x0b, name: 'MAP', short: 'MAP', unit: 'kPa', min: 0, max: 250 },
  { pid: 0x11, name: 'Throttle Pos', short: 'TPS', unit: '%', min: 0, max: 100 },
  { pid: 0x06, name: 'STFT Bank 1', short: 'STFT1', unit: '%', min: -10, max: 10 },
  { pid: 0x07, name: 'LTFT Bank 1', short: 'LTFT1', unit: '%', min: -10, max: 10 },
  { pid: 0x10, name: 'MAF', short: 'MAF', unit: 'g/s', min: 0, max: 200 },
  { pid: 0x42, name: 'Battery V', short: 'VBATT', unit: 'V', min: 11, max: 15 },
];

export default function Dashboard() {
  const [latest, setLatest] = useState<DatalogSample | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const api = (typeof window !== 'undefined' ? (window as any).opentune : null);
    if (!api) return;
    const unsub = api.datalog.onSample((s: any) => setLatest(s));
    return unsub;
  }, []);

  useEffect(() => {
    const api = (typeof window !== 'undefined' ? (window as any).opentune : null);
    if (!api) return;
    api.hardware.status().then((s: any) => setConnected(s.connected));
  }, [latest]);

  return (
    <div>
      <h1>Live Dashboard</h1>
      <p>{connected ? 'Reading live data from the ECU.' : 'Not connected — go to Connect.'}</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Engine Vitals</h2>
        <div className="card-grid">
          {WATCH_PIDS.map(p => {
            const v = latest?.values[p.short];
            const num = typeof v === 'number' ? v : null;
            const pct = (num != null && p.max != null && p.min != null)
              ? Math.max(0, Math.min(100, ((num - p.min) / (p.max - p.min)) * 100))
              : 0;
            return (
              <div className="metric" key={p.short}>
                <div className="label">{p.name}</div>
                <div className="value">
                  {num != null ? num.toFixed(p.unit === 'V' ? 2 : 1) : '—'}
                  <span className="unit">{p.unit}</span>
                </div>
                {p.max != null && (
                  <div className="gauge">
                    <div className="bar"><div style={{ width: `${pct}%` }} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {latest && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Last Sample</h2>
          <table>
            <tbody>
              {Object.entries(latest.values).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ width: 120 }}>{k}</td>
                  <td className="numeric">{typeof v === 'number' ? v.toFixed(2) : v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 12 }}>
            t = {latest.t}ms · {new Date(latest.timestamp).toISOString()}
          </p>
        </div>
      )}
    </div>
  );
}
