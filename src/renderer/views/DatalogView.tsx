import React, { useEffect, useRef, useState } from 'react';
import { DatalogSample, DatalogStatus } from '../types';

function getApi(): any | null {
  return (typeof window !== 'undefined' ? (window as any).opentune : null);
}

const PIDS: Array<{ pid: number; name: string; unit: string; color: string }> = [
  { pid: 0x0c, name: 'RPM',       unit: 'rpm',  color: '#ff6b00' },
  { pid: 0x0d, name: 'SPEED',     unit: 'km/h', color: '#2ec27e' },
  { pid: 0x05, name: 'ECT',       unit: '°C',   color: '#3b82f6' },
  { pid: 0x0b, name: 'MAP',       unit: 'kPa',  color: '#a855f7' },
  { pid: 0x11, name: 'TPS',       unit: '%',    color: '#f5c518' },
  { pid: 0x06, name: 'STFT1',     unit: '%',    color: '#e01b24' },
  { pid: 0x10, name: 'MAF',       unit: 'g/s',  color: '#06b6d4' },
];

const W = 800, H = 240, PAD = 36;

export default function DatalogView({
  dlStatus,
  onStatusChange,
}: {
  dlStatus: DatalogStatus | null;
  onStatusChange: (s: DatalogStatus) => void;
}) {
  const [samples, setSamples] = useState<DatalogSample[]>([]);
  const [intervalMs, setIntervalMs] = useState(100);
  const [enabledPids, setEnabledPids] = useState<Set<number>>(new Set([0x0c, 0x0d, 0x05, 0x0b, 0x11]));
  const [webMode, setWebMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const api = getApi();
    if (!api) {
      setWebMode(true);
      // Synthesise a believable plothole in the browser so the UI is still demonstrable
      const t = samples.length;
      const sample: DatalogSample = {
        t,
        timestamp: Date.now(),
        values: {
          RPM:  850 + Math.round(2400 * Math.abs(Math.sin(t / 12))),
          SPEED: Math.max(0, Math.round(45 * Math.abs(Math.sin(t / 20)))),
          ECT:  88 + Math.round(2 * Math.sin(t / 30)),
          MAP:  35 + Math.round(80 * Math.abs(Math.sin(t / 15))),
          TPS:  Math.max(0, Math.min(100, 12 + Math.round(20 * Math.sin(t / 18)))),
        },
      };
      setSamples(prev => [...prev, sample].slice(-1000));
      return;
    }
    const unsub = api.datalog.onSample((s: any) => {
      setSamples((prev: DatalogSample[]) => {
        const next = [...prev, s];
        return next.length > 1000 ? next.slice(-1000) : next;
      });
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = PAD + (i * (H - 2 * PAD)) / 4;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
    }
    if (samples.length < 2) return;

    for (const pid of PIDS) {
      if (!enabledPids.has(pid.pid)) continue;
      ctx.strokeStyle = pid.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const values: number[] = [];
      samples.forEach(s => {
        const v = s.values[pid.name];
        if (typeof v === 'number') values.push(v);
      });
      if (values.length < 2) continue;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      samples.forEach((s, i) => {
        const v = s.values[pid.name];
        if (typeof v !== 'number') return;
        const x = PAD + (i / (samples.length - 1)) * (W - 2 * PAD);
        const y = (H - PAD) - ((v - min) / range) * (H - 2 * PAD);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    ctx.font = '11px monospace';
    PIDS.filter(p => enabledPids.has(p.pid)).forEach((p, i) => {
      ctx.fillStyle = p.color;
      ctx.fillRect(PAD + i * 110, 4, 12, 4);
      ctx.fillStyle = '#a8a8a8';
      ctx.fillText(`${p.name}`, PAD + i * 110 + 16, 10);
    });
  }, [samples, enabledPids]);

  const start = async () => {
    const api = getApi();
    if (!api) { setWebMode(true); return; }
    const s = await api.datalog.start(Array.from(enabledPids), intervalMs);
    onStatusChange(s);
  };
  const stop = async () => {
    const api = getApi();
    if (!api) return;
    const s = await api.datalog.stop();
    onStatusChange(s);
  };
  const clear = () => setSamples([]);

  const toggle = (pid: number) => {
    setEnabledPids(prev => {
      const n = new Set(prev);
      if (n.has(pid)) n.delete(pid); else n.add(pid);
      return n;
    });
  };

  return (
    <div>
      <h1>Datalog</h1>
      <p>Stream and plot live OBD-II data. The captured trace is what you'd analyze after a
      WOT pull to evaluate AFR, knock, fuel trims, and timing.</p>
      {webMode && (
        <p style={{ color: 'var(--warn)', borderLeft: '3px solid var(--warn)', paddingLeft: 12 }}>
          Web demo — synthesised samples are plotted for UI review. Real ECU streaming requires the desktop app.
        </p>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Controls</h2>
        <div className="toolbar">
          <label>Interval (ms):&nbsp;</label>
          <input
            type="number"
            min={20}
            max={2000}
            step={10}
            value={intervalMs}
            onChange={e => setIntervalMs(parseInt(e.target.value) || 100)}
            style={{ width: 80 }}
            disabled={webMode}
          />
          {dlStatus?.running || webMode
            ? <button className="danger" onClick={stop} disabled={webMode}>Stop</button>
            : <button className="primary" onClick={start} disabled={webMode}>Start</button>}
          <button onClick={clear}>Clear</button>
          <span style={{ marginLeft: 16, color: 'var(--text-2)' }}>
            {dlStatus?.running ? '● recording' : '○ idle'} · {samples.length} samples
          </span>
        </div>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          {PIDS.map(p => (
            <label key={p.pid} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={enabledPids.has(p.pid)}
                onChange={() => toggle(p.pid)}
              />
              <span style={{ color: p.color, fontFamily: 'var(--mono)' }}>{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Live Plot</h2>
        <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: W, display: 'block' }} />
      </div>

      {samples.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Recent Samples</h2>
          <div className="map-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>t (ms)</th>
                  {PIDS.filter(p => enabledPids.has(p.pid)).map(p => <th key={p.pid}>{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {samples.slice(-30).reverse().map((s, i) => (
                  <tr key={i}>
                    <td>{s.t}</td>
                    {PIDS.filter(p => enabledPids.has(p.pid)).map(p => {
                      const v = s.values[p.name];
                      return <td key={p.pid} className="numeric">{typeof v === 'number' ? v.toFixed(2) : '—'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
