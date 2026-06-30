import { test, expect } from '@playwright/test';

const STUB_API = `
window.opentune = {
  hardware: {
    list: async () => [],
    connect: async () => ({ connected: true, transport: 'simulator', device: 'sim', protocol: 'SIM' }),
    disconnect: async () => {},
    status: async () => ({ connected: true, transport: 'simulator', device: 'sim', protocol: 'SIM' }),
  },
  obd2: {
    readPid: async () => ({ raw: '7E8 04 41 0C 1A F8', data: [4, 65, 12, 26, 248], ok: true }),
    readDtcs: async () => [],
    clearDtcs: async () => true,
    vin: async () => '1HGCM82633A123456',
    supportedPids: async () => [],
  },
  maps: {
    list: async () => ([
      {
        id: 'fuel_ve_main', name: 'Volumetric Efficiency (Main Fuel Table)', category: 'fuel',
        xAxis: { name: 'Engine Speed', type: 'RPM', unit: 'rpm', values: [800, 1200, 1600, 2000] },
        yAxis: { name: 'MAP', type: 'MAP', unit: 'kPa', values: [20, 40, 60, 80, 100] },
        data: [42,45,48,52,56, 48,52,56,60,64, 54,58,62,66,70, 60,64,68,72,76],
        unit: '%', scale: 1, offset: 0, min: 0, max: 120, description: 'Main fuel table.',
      },
      {
        id: 'ign_timing_main', name: 'Base Ignition Timing (degrees BTDC)', category: 'ignition',
        xAxis: { name: 'Engine Speed', type: 'RPM', unit: 'rpm', values: [800, 1200, 1600, 2000] },
        yAxis: { name: 'MAP', type: 'MAP', unit: 'kPa', values: [20, 40, 60, 80, 100] },
        data: [12,14,16,18,20, 14,16,18,20,22, 16,18,20,22,24, 18,20,22,24,26],
        unit: '\u00b0BTDC', scale: 1, offset: 0, min: -10, max: 60, description: 'Base ignition.',
      },
    ]),
    get: async (id) => null,
    updateCell: async () => null,
    save: async () => true,
    export: async () => true,
    import: async () => null,
  },
  datalog: {
    start: async () => ({ running: true, pids: [12], intervalMs: 100, samples: 0, startedAt: Date.now() }),
    stop: async () => ({ running: false, pids: [], intervalMs: 100, samples: 0, startedAt: null }),
    status: async () => ({ running: false, pids: [], intervalMs: 100, samples: 0, startedAt: null }),
    snapshot: async () => [],
    onSample: () => () => {},
  },
};
`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(STUB_API);
});

test('OPENTUNE app boots and shows the brand', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.brand')).toContainText('OPENTUNE');
});

test('sidebar navigation lists all sections', async ({ page }) => {
  await page.goto('/');
  const expected = ['Connect', 'Hardware', 'Dashboard', 'Diagnostics (DTCs)', 'Datalog', 'Map Editor'];
  for (const name of expected) {
    await expect(page.locator('.nav-item', { hasText: name })).toBeVisible();
  }
});

test('Connect view renders the transport selector', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-item', { hasText: 'Connect' }).click();
  await expect(page.locator('select')).toBeVisible();
  await expect(page.locator('button:has-text("Connect")')).toBeVisible();
});

test('Map Editor lists default maps', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-item', { hasText: 'Map Editor' }).click();
  await expect(page.locator('text=Volumetric Efficiency')).toBeVisible();
  await expect(page.locator('text=Base Ignition Timing')).toBeVisible();
});

test('Hardware view shows the protocol spec', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-item', { hasText: 'Hardware' }).click();
  await expect(page.locator('text=OpenTune HW')).toBeVisible();
  await expect(page.locator('text=Protocol (host ↔ device)')).toBeVisible();
});
