import React, { useState, useEffect } from 'react';
import { ConnectionStatus, DatalogStatus } from './types';
import Dashboard from './views/Dashboard';
import MapEditor from './views/MapEditor';
import DatalogView from './views/DatalogView';
import DiagnosticsView from './views/DiagnosticsView';
import ConnectView from './views/ConnectView';
import HardwareView from './views/HardwareView';

type View = 'connect' | 'dashboard' | 'maps' | 'datalog' | 'diagnostics' | 'hardware';

const NAV: Array<{ id: View; label: string; group: string }> = [
  { id: 'connect', label: 'Connect', group: 'Setup' },
  { id: 'hardware', label: 'Hardware', group: 'Setup' },
  { id: 'dashboard', label: 'Dashboard', group: 'Live' },
  { id: 'diagnostics', label: 'Diagnostics (DTCs)', group: 'Live' },
  { id: 'datalog', label: 'Datalog', group: 'Live' },
  { id: 'maps', label: 'Map Editor', group: 'Tune' },
];

export default function App() {
  const [view, setView] = useState<View>('connect');
  const [conn, setConn] = useState<ConnectionStatus | null>(null);
  const [dlStatus, setDlStatus] = useState<DatalogStatus | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = async () => {
      try {
        const s = await window.opentune.hardware.status();
        setConn(s);
        if (s.connected) {
          const ds = await window.opentune.datalog.status();
          setDlStatus(ds);
        }
      } catch { /* not in electron yet */ }
    };
    refresh();
    const t = setInterval(refresh, 1500);
    return () => clearInterval(t);
  }, [tick]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">OPENTUNE<span className="tag">v0.1.0 — FOSS ECU tuning</span></div>
        <div className="spacer" />
        <div className="conn-status">
          <span className={`dot ${conn?.connected ? 'ok' : ''}`} />
          {conn?.connected
            ? <span>Connected · {conn.transport} · {conn.protocol ?? '?'}</span>
            : <span>Disconnected</span>}
        </div>
      </header>

      <nav className="sidebar">
        {Array.from(new Set(NAV.map(n => n.group))).map(group => (
          <React.Fragment key={group}>
            <div className="nav-group">{group}</div>
            {NAV.filter(n => n.group === group).map(n => (
              <div
                key={n.id}
                className={`nav-item ${view === n.id ? 'active' : ''}`}
                onClick={() => setView(n.id)}
              >{n.label}</div>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <main className="main">
        {view === 'connect' && <ConnectView onConnected={() => setTick(t => t + 1)} />}
        {view === 'hardware' && <HardwareView />}
        {view === 'dashboard' && <Dashboard />}
        {view === 'diagnostics' && <DiagnosticsView />}
        {view === 'datalog' && <DatalogView dlStatus={dlStatus} onStatusChange={setDlStatus} />}
        {view === 'maps' && <MapEditor />}
      </main>

      <footer className="statusbar">
        <span className={conn?.connected ? 'ok' : 'err'}>
          {conn?.connected ? '● LIVE' : '○ OFFLINE'}
        </span>
        <span>transport: {conn?.transport ?? 'none'}</span>
        <span>device: {conn?.device ?? '—'}</span>
        <span style={{ flex: 1 }} />
        {dlStatus?.running && <span className="ok">● datalogging · {dlStatus.samples} samples</span>}
        <span>OPENTUNE · GPL-3.0</span>
      </footer>
    </div>
  );
}
