/**
 * OPENTUNE — Electron main process entry point
 * Manages window creation, IPC routing, and the hardware layer.
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { HardwareManager } from './hardware/manager';
import { OBD2Service } from './services/obd2';
import { MapService } from './services/maps';
import { DatalogService } from './services/datalog';
import { logger } from './util/logger';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let hardware: HardwareManager;
let obd2: OBD2Service;
let maps: MapService;
let datalog: DatalogService;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'OPENTUNE',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

function setupIpc() {
  // ===== HARDWARE =====
  ipcMain.handle('hw:list', () => hardware.listDevices());
  ipcMain.handle('hw:connect', (_, transport: string, device: string) =>
    hardware.connect(transport, device)
  );
  ipcMain.handle('hw:disconnect', () => hardware.disconnect());
  ipcMain.handle('hw:status', () => hardware.status());

  // ===== OBD-II =====
  ipcMain.handle('obd2:readPid', (_, mode: number, pid: number) =>
    obd2.readPid(mode, pid)
  );
  ipcMain.handle('obd2:readDtcs', () => obd2.readDtcs());
  ipcMain.handle('obd2:clearDtcs', () => obd2.clearDtcs());
  ipcMain.handle('obd2:vin', () => obd2.readVin());
  ipcMain.handle('obd2:supportedPids', () => obd2.supportedPids(0x01));

  // ===== MAPS =====
  ipcMain.handle('maps:list', () => maps.list());
  ipcMain.handle('maps:get', (_, id: string) => maps.get(id));
  ipcMain.handle('maps:updateCell', (_, id: string, row: number, col: number, value: number) =>
    maps.updateCell(id, row, col, value)
  );
  ipcMain.handle('maps:save', (_, id: string) => maps.save(id));
  ipcMain.handle('maps:export', async (_, id: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Export map',
      defaultPath: `${id}.opentune.json`,
      filters: [{ name: 'OPENTUNE map', extensions: ['json'] }],
    });
    if (result.canceled || !result.filePath) return null;
    return maps.exportToFile(id, result.filePath);
  });
  ipcMain.handle('maps:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Import map',
      filters: [{ name: 'OPENTUNE map', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return maps.importFromFile(result.filePaths[0]);
  });

  // ===== DATALOG =====
  ipcMain.handle('datalog:start', (_, pids: number[], intervalMs: number) =>
    datalog.start(pids, intervalMs)
  );
  ipcMain.handle('datalog:stop', () => datalog.stop());
  ipcMain.handle('datalog:status', () => datalog.status());
  ipcMain.handle('datalog:snapshot', () => datalog.snapshot());

  // Pushing live datalog samples to the renderer
  datalog.on('sample', (sample) => {
    mainWindow?.webContents.send('datalog:sample', sample);
  });
}

app.whenReady().then(async () => {
  logger.info('OPENTUNE starting...');
  hardware = new HardwareManager();
  obd2 = new OBD2Service(hardware);
  maps = new MapService();
  datalog = new DatalogService(obd2);
  setupIpc();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  hardware?.disconnect();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  hardware?.disconnect();
});
