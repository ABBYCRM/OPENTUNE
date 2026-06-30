import React, { useEffect, useMemo, useState } from 'react';
import { MapTable } from '../types';

function getApi(): any | null {
  return (typeof window !== 'undefined' ? (window as any).opentune : null);
}

export default function MapEditor() {
  const [maps, setMaps] = useState<MapTable[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [current, setCurrent] = useState<MapTable | null>(null);
  const [msg, setMsg] = useState('');
  const [webMode, setWebMode] = useState(false);

  useEffect(() => {
    const api = getApi();
    if (!api) {
      setWebMode(true);
      // Use SAMPLE_MAPS as inline fallback so the UI is still demonstrable in browser
      const samples: MapTable[] = [
        {
          id: 'fuel_ve_main',
          name: 'Volumetric Efficiency (Main Fuel Table)',
          category: 'fuel',
          xAxis: { name: 'Engine Speed', type: 'RPM', unit: 'rpm',
            values: [800,1200,1600,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000] },
          yAxis: { name: 'MAP', type: 'MAP', unit: 'kPa',
            values: [20,30,40,50,60,80,100,120,140,160,180,200,220,240] },
          data: Array.from({length: 196}, (_, i) => 50 + (i % 40) * 1.2),
          unit: '%', scale: 1, offset: 0, min: 0, max: 120,
          description: 'Web demo map (synthesised). Run npm run dev for the real Electron-backed editor.',
        },
        {
          id: 'ign_timing_main',
          name: 'Base Ignition Timing (degrees BTDC)',
          category: 'ignition',
          xAxis: { name: 'Engine Speed', type: 'RPM', unit: 'rpm',
            values: [800,1200,1600,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000] },
          yAxis: { name: 'MAP', type: 'MAP', unit: 'kPa',
            values: [20,30,40,50,60,80,100,120,140,160,180,200,220,240] },
          data: Array.from({length: 196}, (_, i) => 18 + (i % 60) * 0.5),
          unit: '°BTDC', scale: 1, offset: 0, min: -10, max: 60,
          description: 'Web demo map (synthesised).',
        },
        {
          id: 'boost_target',
          name: 'Boost Target (MAP-based)',
          category: 'boost',
          xAxis: { name: 'Engine Speed', type: 'RPM', unit: 'rpm',
            values: [1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000] },
          yAxis: { name: 'Gear', type: 'CUSTOM', unit: 'gear',
            values: [1,2,3,4,5,6] },
          data: [140,150,160,170,180,190, 150,165,180,190,200,210, 160,180,200,215,225,235,
                 170,190,215,230,240,250, 180,200,225,240,250,260, 180,200,225,240,250,260,
                 190,210,235,250,260,270, 200,220,245,260,270,280, 200,220,245,260,270,280,
                 210,230,255,270,280,290, 210,230,255,270,280,290],
          unit: 'kPa', scale: 1, offset: 0, min: 100, max: 300,
          description: 'Web demo map (synthesised).',
        },
      ];
      setMaps(samples);
      setSelected(samples[0].id);  // Auto-open the first sample map so the editor is interactive immediately.
      return;
    }
    api.maps.list().then((m: MapTable[]) => {
      setMaps(m);
      if (m.length > 0) setSelected(m[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) { setCurrent(null); return; }
    const api = getApi();
    if (!api) {
      // webMode branch: find the sample in `maps` state instead.
      const m = maps.find(x => x.id === selected) ?? null;
      setCurrent(m);
      return;
    }
    api.maps.get(selected).then(setCurrent);
  }, [selected, maps]);

  const updateCell = async (row: number, col: number, value: number) => {
    if (!current) return;
    const api = getApi();
    if (!api) { setMsg('Updates require the desktop app (npm run dev).'); return; }
    try {
      const updated = await api.maps.updateCell(current.id, row, col, value);
      if (updated) setCurrent(updated);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const save = async () => {
    if (!current) return;
    const api = getApi();
    if (!api) { setMsg('Save requires the desktop app.'); return; }
    const ok = await api.maps.save(current.id);
    setMsg(ok ? `Saved ${current.id}` : 'Save failed');
  };

  const exportMap = async () => {
    if (!current) return;
    const api = getApi();
    if (!api) { setMsg('Export requires the desktop app.'); return; }
    const result = await api.maps.export(current.id);
    setMsg(result ? 'Exported' : 'Export cancelled');
  };

  const importMap = async () => {
    const api = getApi();
    if (!api) { setMsg('Import requires the desktop app.'); return; }
    const m = await api.maps.import();
    if (m) {
      setCurrent(m);
      setSelected(m.id);
      const list = await api.maps.list();
      setMaps(list);
      setMsg(`Imported ${m.id}`);
    }
  };

  const cellColor = useMemo(() => {
    if (!current) return () => '#000';
    return (v: number) => {
      const t = (v - current.min) / (current.max - current.min);
      const r = Math.round(255 * Math.max(0, Math.min(1, t * 1.4 - 0.4)));
      const g = Math.round(255 * Math.max(0, 1 - Math.abs(t - 0.5) * 2));
      const b = Math.round(255 * Math.max(0, 1 - t * 1.4));
      return `rgb(${r},${g},${b})`;
    };
  }, [current]);

  return (
    <div>
      <h1>Map Editor</h1>
      <p>Edit fuel, ignition, boost, and other calibration tables. Cell values can be edited
      directly; dirty cells are highlighted. Save writes to your local OPENTUNE userData
      directory; export produces a portable JSON file.</p>
      {webMode && (
        <p style={{ color: 'var(--warn)', borderLeft: '3px solid var(--warn)', paddingLeft: 12, marginBottom: 12 }}>
          Web demo — showing synthesised sample maps. To load real maps and persist edits,
          run <code>npm run dev</code> locally.
        </p>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Map Catalog</h2>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Size</th><th>Unit</th></tr></thead>
          <tbody>
            {maps.map(m => (
              <tr key={m.id}
                  style={{ cursor: 'pointer', background: selected === m.id ? 'var(--bg-3)' : undefined }}
                  onClick={() => setSelected(m.id)}>
                <td><code>{m.id}</code></td>
                <td>{m.name}</td>
                <td>{m.category}</td>
                <td>{m.xAxis.values.length} × {m.yAxis.values.length}</td>
                <td>{m.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {current && (
        <div className="card">
          <div className="toolbar">
            <h2 style={{ margin: 0 }}>{current.name}</h2>
            <span style={{ color: 'var(--text-2)' }}>· {current.description}</span>
            <span style={{ flex: 1 }} />
            <button onClick={save} disabled={webMode}>💾 Save</button>
            <button onClick={exportMap} disabled={webMode}>📤 Export</button>
            <button onClick={importMap} disabled={webMode}>📥 Import</button>
          </div>

          <div className="map-grid-wrapper">
            <div className="map-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {current.yAxis.values.map((v, i) => (
                      <th key={i} style={{ textAlign: 'center' }}>
                        {v} {current.yAxis.unit}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.xAxis.values.map((xv, r) => (
                    <tr key={r}>
                      <th style={{ whiteSpace: 'nowrap' }}>{xv} {current.xAxis.unit}</th>
                      {current.yAxis.values.map((_, c) => {
                        const idx = r * current.yAxis.values.length + c;
                        const v = current.data[idx];
                        return (
                          <td key={c} style={{ padding: 0 }}>
                            <input
                              className="map-cell"
                              type="number"
                              defaultValue={v}
                              readOnly={webMode}
                              onBlur={webMode ? undefined : (e) => {
                                const newVal = parseFloat(e.target.value);
                                if (!isNaN(newVal) && newVal !== v) updateCell(r, c, newVal);
                              }}
                              style={{ background: cellColor(v) }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>
              Range: {current.min} – {current.max} {current.unit}. Click a cell, type, and press
              Tab or click away to commit.
            </p>
          </div>
        </div>
      )}

      {msg && <p>{msg}</p>}
    </div>
  );
}
