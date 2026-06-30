import React, { useState } from 'react';

export default function DiagnosticsView() {
  const [dtcs, setDtcs] = useState<string[] | null>(null);
  const [vin, setVin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const readDtcs = async () => {
    setBusy(true); setMsg('');
    try {
      const d = await window.opentune.obd2.readDtcs();
      setDtcs(d);
      setMsg(d.length === 0 ? 'No DTCs — ECU reports clean.' : `Found ${d.length} DTC(s).`);
    } catch (err: any) {
      setMsg(`Error: ${err.message || err}`);
    } finally { setBusy(false); }
  };

  const clearDtcs = async () => {
    if (!confirm('Clear all DTCs and freeze-frame data? The MIL will turn off.')) return;
    setBusy(true); setMsg('');
    try {
      const ok = await window.opentune.obd2.clearDtcs();
      setMsg(ok ? 'DTCs cleared. MIL should extinguish on next crank.' : 'Clear failed.');
      if (ok) setDtcs([]);
    } catch (err: any) {
      setMsg(`Error: ${err.message || err}`);
    } finally { setBusy(false); }
  };

  const readVin = async () => {
    setBusy(true); setMsg('');
    try {
      const v = await window.opentune.obd2.vin();
      setVin(v);
      setMsg(`VIN: ${v}`);
    } catch (err: any) {
      setMsg(`Error: ${err.message || err}`);
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h1>Diagnostics</h1>
      <p>Read and clear OBD-II Diagnostic Trouble Codes (DTCs), pull the VIN, and inspect
      emissions readiness.</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>DTCs (Mode 03 / 04)</h2>
        <div className="toolbar">
          <button className="primary" onClick={readDtcs} disabled={busy}>Read DTCs</button>
          <button className="danger" onClick={clearDtcs} disabled={busy}>Clear DTCs</button>
        </div>
        {dtcs === null
          ? <p style={{ color: 'var(--text-2)' }}>No scan run yet.</p>
          : dtcs.length === 0
            ? <div className="dtc-empty">● No DTCs stored</div>
            : (
              <table>
                <thead><tr><th>Code</th><th>System</th><th>Type</th></tr></thead>
                <tbody>
                  {dtcs.map(c => {
                    const sys = { P: 'Powertrain', C: 'Chassis', B: 'Body', U: 'Network' }[c[0]] ?? '?';
                    return <tr key={c}><td className="dtc-code">{c}</td><td>{sys}</td><td>—</td></tr>;
                  })}
                </tbody>
              </table>
            )
        }
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Vehicle Identification</h2>
        <div className="toolbar">
          <button onClick={readVin} disabled={busy}>Read VIN (Mode 09 PID 02)</button>
        </div>
        {vin && <p style={{ fontFamily: 'var(--mono)' }}>VIN: <strong>{vin}</strong></p>}
      </div>

      {msg && <p style={{ color: 'var(--text-1)' }}>{msg}</p>}
    </div>
  );
}
