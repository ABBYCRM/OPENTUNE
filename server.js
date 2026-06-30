/**
 * OPENTUNE — Production web server
 * Serves the built Vite renderer (dist/renderer) as a static site.
 * Also exposes a minimal JSON API for the render-side demo
 * (so visitors can see live "fake" telemetry in the browser).
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';
const RENDERER_DIR = path.join(__dirname, 'dist', 'renderer');

// ===== Health & status =====
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: 'opentune', version: '0.1.0', uptime: process.uptime() });
});

app.get('/api/info', (_req, res) => {
  res.json({
    name: 'OPENTUNE',
    version: '0.1.0',
    license: 'GPL-3.0',
    repo: 'https://github.com/ABBYCRM/OPENTUNE',
    description: 'FOSS, cross-platform, OBD2-compatible ECU tuning suite.',
    features: [
      'OBD-II PIDs (SAE J1979)',
      'ELM327 / J2534 / OpenTune HW transports',
      'ISO-TP multi-frame UDS',
      'Live datalog',
      'Map editor (2D heatmap)',
      'DTC read/clear',
    ],
  });
});

// Demo telemetry endpoint — synthesises a believable sample.
let t = 0;
app.get('/api/telemetry', (_req, res) => {
  t += 1;
  const rpm = 850 + Math.round(2400 * Math.abs(Math.sin(t / 12)));
  const speed = Math.max(0, Math.round(45 * Math.abs(Math.sin(t / 20))));
  const ect = 88 + Math.round(2 * Math.sin(t / 30));
  const iat = 28 + Math.round(3 * Math.sin(t / 25));
  const map = 35 + Math.round(80 * Math.abs(Math.sin(t / 15)));
  const tps = Math.max(0, Math.min(100, 12 + Math.round(20 * Math.sin(t / 18))));
  const stft = Math.round(((Math.sin(t / 17) * 5) + Number.EPSILON) * 10) / 10;
  const ltft = Math.round(((Math.sin(t / 31) * 3) + Number.EPSILON) * 10) / 10;
  const maf = +(3.2 + 2.4 * Math.abs(Math.sin(t / 14))).toFixed(2);
  const vbatt = +(13.9 + 0.2 * Math.sin(t / 22)).toFixed(2);
  res.json({
    timestamp: Date.now(),
    t,
    values: { RPM: rpm, SPEED: speed, ECT: ect, IAT: iat, MAP: map, TPS: tps, STFT1: stft, LTFT1: ltft, MAF: maf, VBATT: vbatt },
  });
});

// ===== Static renderer =====
if (fs.existsSync(RENDERER_DIR)) {
  app.use(express.static(RENDERER_DIR));
  app.get('*', (_req, res) => res.sendFile(path.join(RENDERER_DIR, 'index.html')));
} else {
  // Build hasn't run yet — serve a placeholder so the service is still reachable.
  app.get('*', (_req, res) => {
    res.status(503).type('html').send(`
      <!doctype html><html><head><meta charset="utf-8"><title>OPENTUNE</title>
      <style>body{background:#0a0a0a;color:#f0f0f0;font-family:monospace;padding:40px;}</style>
      </head><body>
        <h1>OPENTUNE — build in progress</h1>
        <p>The renderer is not yet built. The site will be available at <code>/</code> once the build finishes.</p>
        <p>Repo: <a href="https://github.com/ABBYCRM/OPENTUNE" style="color:#ff6b00;">ABBYCRM/OPENTUNE</a></p>
      </body></html>
    `);
  });
}

app.listen(PORT, HOST, () => {
  console.log(`[OPENTUNE] listening on ${HOST}:${PORT}`);
  console.log(`[OPENTUNE] serving renderer from ${RENDERER_DIR}`);
});
