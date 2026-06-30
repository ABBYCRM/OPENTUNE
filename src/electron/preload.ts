/**
 * OPENTUNE — Preload script
 * Exposes a typed API surface to the renderer over contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

const api = {
  hardware: {
    list: () => ipcRenderer.invoke('hw:list'),
    connect: (transport: string, device: string) =>
      ipcRenderer.invoke('hw:connect', transport, device),
    disconnect: () => ipcRenderer.invoke('hw:disconnect'),
    status: () => ipcRenderer.invoke('hw:status'),
  },
  obd2: {
    readPid: (mode: number, pid: number) => ipcRenderer.invoke('obd2:readPid', mode, pid),
    readDtcs: () => ipcRenderer.invoke('obd2:readDtcs'),
    clearDtcs: () => ipcRenderer.invoke('obd2:clearDtcs'),
    vin: () => ipcRenderer.invoke('obd2:vin'),
    supportedPids: () => ipcRenderer.invoke('obd2:supportedPids'),
  },
  maps: {
    list: () => ipcRenderer.invoke('maps:list'),
    get: (id: string) => ipcRenderer.invoke('maps:get', id),
    updateCell: (id: string, row: number, col: number, value: number) =>
      ipcRenderer.invoke('maps:updateCell', id, row, col, value),
    save: (id: string) => ipcRenderer.invoke('maps:save', id),
    export: (id: string) => ipcRenderer.invoke('maps:export', id),
    import: () => ipcRenderer.invoke('maps:import'),
  },
  datalog: {
    start: (pids: number[], intervalMs: number) =>
      ipcRenderer.invoke('datalog:start', pids, intervalMs),
    stop: () => ipcRenderer.invoke('datalog:stop'),
    status: () => ipcRenderer.invoke('datalog:status'),
    snapshot: () => ipcRenderer.invoke('datalog:snapshot'),
    onSample: (cb: (sample: any) => void) => {
      const handler = (_: any, sample: any) => cb(sample);
      ipcRenderer.on('datalog:sample', handler);
      return () => ipcRenderer.removeListener('datalog:sample', handler);
    },
  },
};

contextBridge.exposeInMainWorld('opentune', api);

export type OpentuneAPI = typeof api;
