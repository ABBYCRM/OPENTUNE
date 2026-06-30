import React, { useEffect, useMemo, useState } from 'react';
import { MapTable } from '../types';

export default function MapEditor() {
  const [maps, setMaps] = useState<MapTable[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [current, setCurrent] = useState<MapTable | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    window.opentune.maps.list().then(setMaps);
  }, []);

  useEffect(() => {
    if (selected) {
      window.opentune.maps.get(selected).then(setCurrent);
    } else {
      setCurrent(null);
    }
  }, [selected]);

  const updateCell = async (row: number, col: number, value: number) => {
    if (!current) return;
    try {
      const updated = await window.opentune.maps.updateCell(current.id, row, col, value);
      if (updated) setCurrent(updated);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const save = async () => {
    if (!current) return;
    const ok = await window.opentune.maps.save(current.id);
    setMsg(ok ? `Saved ${current.id}` : 'Save failed');
  };

  const exportMap = async () => {
    if (!current) return;
    const result = await window.opentune.maps.export(current.id);
    setMsg(result ? 'Exported' : 'Export cancelled');
  };

  const importMap = async () => {
    const m = await window.opentune.maps.import();
    if (m) {
      setCurrent(m);
      setSelected(m.id);
      const list = await window.opentune.maps.list();
      setMaps(list);
      setMsg(`Imported ${m.id}`);
    }
  };

  const cellColor = useMemo(() => {
    if (!current) return () => '#000';
    return (v: number) => {
      const t = (v - current.min) / (current.max - current.min);
      // simple heatmap: blue → cyan → yellow → red
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
            <button onClick={save}>💾 Save</button>
            <button onClick={exportMap}>📤 Export</button>
            <button onClick={importMap}>📥 Import</button>
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
                              onBlur={(e) => {
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
