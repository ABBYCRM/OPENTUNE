import React, { useEffect, useState } from 'react';
import { DeviceInfo, ConnectionStatus } from '../types';

export default function ConnectView({ onConnected }: { onConnected: () => void }) {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [transport, setTransport] = useState('simulator');
  const [device, setDevice] = useState('simulator://internal');
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const api = (typeof window !== 'undefined' ? (window as any).opentune : null);
    if (!api) {
      setError('Web demo mode: this build is the renderer running without the Electron host. Map editor, datalog mock data, and DTC stubs are still browseable. For live OBD-II / ELM327 connectivity, run `npm run dev` locally.');
      setStatus({ connected: false, transport: null, device: null, protocol: null });
      return;
    }
    try {
      const d = await api.hardware.list();
      setDevices(d);
    } catch (err: any) {
      setError(err.message);
    }
    try {
      const s = await api.hardware.status();
      setStatus(s);
    } catch {}
  };

  useEffect(() => { refresh(); }, []);

  const connect = async () => {
    setBusy(true);
    setError(null);
    const api = (typeof window !== 'undefined' ? (window as any).opentune : null);
    if (!api) {
      setError('Connect requires the desktop app (npm run dev). This web demo cannot reach a vehicle.');
      setBusy(false);
      return;
    }
    try {
      const s = await api.hardware.connect(transport, device);
      setStatus(s);
      onConnected();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    const api = (typeof window !== 'undefined' ? (window as any).opentune : null);
    if (!api) { setBusy(false); return; }
    try {
      await api.hardware.disconnect();
      setStatus({ connected: false, transport: null, device: null, protocol: null });
      onConnected();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Connect to ECU</h1>
      <p>OPENTUNE talks to your car's ECU through one of several transport layers. Pick what you have:</p>

      <div className="card">
        <div className="toolbar">
          <label htmlFor="transport-select">Transport:&nbsp;</label>
          <select
            id="transport-select"
            aria-label="OBD-II transport selection"
            value={transport} onChange={e => {
              const t = e.target.value;
              setTransport(t);
              if (t === 'simulator') setDevice('simulator://internal');
              else if (devices[0]) setDevice(devices[0].path);
            }}>
            <option value="simulator">Simulator (no hardware, fake data)</option>
            <option value="elm327">ELM327 (USB / Serial)</option>
            <option value="elm327-bt">ELM327 (Bluetooth)</option>
            <option value="opentune-hw">OpenTune HW (custom)</option>
            <option value="j2534">J2534 (Windows, Tactrix etc.)</option>
          </select>
          <label htmlFor="device-input">Device:&nbsp;</label>
          <input
            id="device-input"
            aria-label="Serial device path or Bluetooth address"
            value={device}
            onChange={e => setDevice(e.target.value)}
            style={{ minWidth: 280 }}
            disabled={transport === 'simulator'}
          />
          <button onClick={refresh}>↻ Rescan</button>
        </div>

        {devices.length > 0 && transport !== 'simulator' && (
          <table>
            <thead><tr><th>Path</th><th>Manufacturer</th><th>VID</th><th>PID</th><th></th></tr></thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.path}>
                  <td>{d.path}</td>
                  <td>{d.manufacturer ?? '—'}</td>
                  <td>{d.vendorId ?? '—'}</td>
                  <td>{d.productId ?? '—'}</td>
                  <td><button onClick={() => setDevice(d.path)}>Use</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="toolbar" style={{ marginTop: 12 }}>
          {status?.connected ? (
            <button className="danger" onClick={disconnect} disabled={busy}>Disconnect</button>
          ) : (
            <button className="primary" onClick={connect} disabled={busy}>
              {busy ? 'Connecting…' : 'Connect'}
            </button>
          )}
          {status?.connected && (
            <span className="ok" style={{ fontFamily: 'var(--mono)' }}>
              ● Connected · {status.transport} · {status.protocol ?? 'protocol auto'}
            </span>
          )}
        </div>
        {error && <p style={{ color: 'var(--err)' }}>Error: {error}</p>}
      </div>

      <h2>About each transport</h2>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Simulator</h2>
        <p>No hardware needed. Generates plausible OBD-II responses so you can explore the UI.
        Perfect for development, demos, and CI. Cannot flash — by design.</p>

        <h2>ELM327 (USB / Bluetooth / WiFi)</h2>
        <p>The classic $15 OBD-II adapter. Works for diagnostics, live data, and DTCs.
        Cannot reflash a locked ECU (the ELM327 firmware is read-only by design).</p>

        <h2>OpenTune HW (your build)</h2>
        <p>Custom interface. Will speak the same protocol as the ELM327 over USB-CDC for
        compatibility, plus the OpenTune HW extension protocol for boot-mode and high-speed
        flashing on supported open ECUs (Speeduino, RusEFI, MegaSquirt).</p>

        <h2>J2534 (Tactrix OpenPort 2.0 etc.)</h2>
        <p>Industry-standard pass-thru interface. Higher bandwidth than ELM327. Required for
        full UDS flashing on supported vehicles.</p>
      </div>
    </div>
  );
}
