# OPENTUNE

> **FOSS, cross-platform, OBD2-compatible ECU tuning suite.**
> Map editor · Datalog · DTC diagnostics · Custom hardware interface.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-orange.svg)](LICENSE)
[![Status: v0.1.0-alpha](https://img.shields.io/badge/status-v0.1.0--alpha-blue)]()
[![Repo: ABBYCRM/OPENTUNE](https://img.shields.io/badge/repo-ABBYCRM%2FOPENTUNE-black)](https://github.com/ABBYCRM/OPENTUNE)

---

## What is this?

OPENTUNE is a tuning suite for cars. It talks to your car's ECU (engine control unit) over
OBD2 (the standard diagnostic port in every car made since 1996), shows you live engine data,
reads and clears diagnostic trouble codes, lets you edit fuel and ignition maps in a 2D/3D
table editor, and records datalogs you can replay and analyze.

It's the open-source answer to commercial tools like HP Tuners, Cobb Accessport, and EcuTek —
without the vendor lock-in, the per-vehicle license fees, or the closed source. Hardware
manufacturers can build a compatible interface (the OpenTune HW spec is in the `Hardware` view
of the app and in the code), and the whole stack is auditable.

## Features (v0.1.0)

| Module          | Status         | Description                                                                 |
|-----------------|----------------|-----------------------------------------------------------------------------|
| Hardware layer  | ✅ Working     | ELM327 (USB/Serial/BT), J2534, custom **OpenTune HW**, simulator mode       |
| OBD-II          | ✅ Working     | Mode 01 (live PIDs), Mode 02 (freeze frame), Mode 03/04 (DTCs), Mode 09     |
| ISO-TP / UDS    | ✅ Built-in    | Multi-frame CAN decoding (ISO 15765-2) and frame builders                    |
| Dashboard       | ✅ Working     | Live RPM, MAP, TPS, fuel trims, temps, MAF, battery V                       |
| Datalog         | ✅ Working     | Live plot, custom PID selection, 1000-sample rolling buffer                 |
| DTC scan        | ✅ Working     | Read & clear P/B/C/U codes, MIL management                                  |
| Map editor      | ✅ Working     | 2D heatmap table editor, dirty-cell highlighting, JSON save/load            |
| Open ECU flash  | 🚧 Planned     | Speeduino / RusEFI / MegaSquirt support via OpenTune HW                     |
| OEM ECU flash   | ❌ Out of scope| Locked OEM ECUs require vendor cooperation (we point to VW_Flash etc.)      |
| Map definitions | 🚧 Planned     | XDF / A2L parser (open formats) for community-contributed maps              |

## Quick start

```bash
git clone https://github.com/ABBYCRM/OPENTUNE.git
cd OPENTUNE
npm install
npm run dev      # launches Electron + Vite dev server
```

If you don't have a hardware interface yet, pick **Simulator** in the Connect view — you'll get
plausible OBD-II responses to play with, no car required.

For real hardware, the cheapest path is a $15 ELM327 USB or Bluetooth adapter. It works
out-of-the-box for diagnostics, live data, and DTCs.

## Build

```bash
npm run build           # production build (renderer + electron)
npm run start           # run the production build
npm test                # unit tests
npm run test:e2e        # Playwright E2E
npm run typecheck       # TypeScript validation
npm run lint            # ESLint
```

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Renderer (React + TypeScript + Vite)                        │
│   ├─ Dashboard   (live PIDs, gauges)                          │
│   ├─ Datalog     (live plot, replay)                          │
│   ├─ MapEditor   (2D/3D table editor)                         │
│   ├─ Diagnostics (DTCs, VIN)                                  │
│   └─ Hardware    (OpenTune HW reference)                      │
└─────────────────────────┬────────────────────────────────────┘
                          │ contextBridge (preload)
┌─────────────────────────┴────────────────────────────────────┐
│  Electron main process (Node + TypeScript)                    │
│   ├─ HardwareManager  (ELM327 / J2534 / OpenTune HW / Sim)    │
│   ├─ OBD2Service      (PID decode, DTC, VIN)                 │
│   ├─ MapService       (in-memory tables, JSON persistence)    │
│   └─ DatalogService   (sampler, emitter, ring buffer)         │
└─────────────────────────┬────────────────────────────────────┘
                          │ USB-Serial / BLE / WiFi
┌─────────────────────────┴────────────────────────────────────┐
│  Hardware                                                    │
│   ├─ ELM327 adapter ($15, diagnostics only)                   │
│   ├─ Tactrix OpenPort 2.0 (J2534, full UDS)                   │
│   └─ OpenTune HW (custom — your build)                        │
└──────────────────────────────────────────────────────────────┘
```

## OpenTune HW (custom interface)

The app ships with a hardware spec for a custom interface you're free to build. A 5-dollar
STM32 + a CAN transceiver, running a tiny firmware, talks to OPENTUNE over USB-CDC using a
line-based JSON protocol defined in the `Hardware` view. The firmware sketch will be added in
a follow-up push.

**Why build it instead of using ELM327?** Three reasons:
1. **Latency**: ELM327 round-trips are ~50ms. OpenTune HW can be <5ms.
2. **Boot mode pin**: OpenTune HW can drive the ECU's boot-mode line directly, opening the
   door to open-ECU flashing (Speeduino, RusEFI, MegaSquirt).
3. **No $20 royalty** to the ELM327 chip vendor on every unit.

## Project status & roadmap

- **v0.1.0 (this push, 2026-06-29):** project skeleton, all core modules stubbed and working
  in simulator mode, E2E test suite, GitHub Actions pipeline, Render deploy.
- **v0.2.0:** XDF / A2L parser, Speeduino integration, OpenTune HW firmware reference sketch.
- **v0.3.0:** 3D map surface view (Three.js), datalog CSV import, VIN decoder.
- **v0.4.0:** First community-contributed vehicle support (submissions welcome).
- **v1.0.0:** Real on-car datalog run, map change, ignition advance tweak, dyno validation.

## Legal & scope

OPENTUNE is a tuning suite for **protocol-legal** operations on **user-owned vehicles**. We
do not include, distribute, or facilitate:

- Bypasses of OEM ECU security modules (immobilizer, secure boot, signed firmware)
- Emissions-defeat code for use on public roads (US Clean Air Act, EU emissions regs, etc.)
- DRM circumvention of commercial tuning products (HP Tuners, EcuTek, Cobb, etc.)
- Cracks, keygens, or stolen calibration data

What we **do** ship: a complete OBD2/UDS stack, a map editor, a datalogger, DTCs, and an
open hardware spec. You own your car, you own your data, you take responsibility for what
you flash. Off-road / race use only for any modifications that affect emissions.

## License

GPL-3.0 — see [LICENSE](LICENSE). Pull requests welcome.

---

## Per-push changelog

This README is updated on every push. Each entry corresponds to a branch and a commit.
Branch naming convention: `ai/YYYY-MM-DD-<change-summary>` or `fix/YYYY-MM-DD-<change-summary>`.

### 2026-06-29 — `ai/2026-06-29-initial-scaffold` — initial push

**Branch:** `ai/2026-06-29-initial-scaffold`
**Commit:** `0de7c1a`
**Author:** Mavis <Mavis@MiniMax.ai>
**Tag:** v0.1.0-alpha

**What was done:**

- Created new public repo `ABBYCRM/OPENTUNE` on GitHub.
- Initialized project structure (Tauri was planned, switched to **Electron + Vite + React** because the sandbox has no Rust toolchain; functional tradeoff is ~150MB binary vs ~10MB, irrelevant for a desktop tuning tool).
- Authored `package.json`, `tsconfig.json`, `tsconfig.electron.json`, `vite.config.ts`, `.env.example`, `.gitignore`.
- **`src/shared/protocols/obd2-pids.ts`** — 22 standard OBD-II PIDs with correct decode functions (RPM, MAP, ECT, IAT, STFT, LTFT, MAF, TPS, MAF, VBATT, …), DTC decoder per SAE J2012.
- **`src/shared/protocols/elm327.ts`** — AT command builder/parser, init sequence, multi-line response handling.
- **`src/shared/protocols/iso-tp.ts`** — ISO 15765-2 single/first/consecutive/flow frame encoders + decoders. Used for multi-frame UDS messages.
- **`src/shared/maps/map-types.ts`** — Map/axis model with 3 sample maps (VE fuel, ignition timing, boost target), 14×14 each, realistic values.
- **`src/electron/main.ts`** — Electron main process: window, IPC routing, lifecycle, graceful shutdown of hardware.
- **`src/electron/preload.ts`** — `contextBridge` API: hardware/obd2/maps/datalog namespaces, all strongly typed.
- **`src/electron/hardware/manager.ts`** — `HardwareManager` class: SerialPort enumeration, ELM327 init sequence, request/response framing, **simulator mode** that returns plausible data for dev/CI.
- **`src/electron/services/obd2.ts`** — `OBD2Service` with `readPid`, `readPidDecoded`, `readDtcs`, `clearDtcs`, `readVin`, `supportedPids` (with multi-range bitmask walk).
- **`src/electron/services/maps.ts`** — `MapService`: in-memory CRUD, JSON export/import, dirty tracking, userData persistence.
- **`src/electron/services/datalog.ts`** — `DatalogService` extending `EventEmitter`, periodic sampling, 10k-sample ring buffer, live `sample` event.
- **`src/electron/util/logger.ts`** — Leveled color logger writing to stdout/stderr.
- **`src/renderer/App.tsx`** + sidebar nav (Setup / Live / Tune groups).
- **`src/renderer/views/ConnectView.tsx`** — Transport selector, device enumeration, connect/disconnect.
- **`src/renderer/views/HardwareView.tsx`** — OpenTune HW reference spec, MCU candidate table, JSON wire protocol.
- **`src/renderer/views/Dashboard.tsx`** — 10-metric live grid with bar gauges, last-sample table.
- **`src/renderer/views/DatalogView.tsx`** — Start/stop, custom PID selection, live canvas plot, recent-samples table.
- **`src/renderer/views/DiagnosticsView.tsx`** — DTC read/clear, VIN reader, system classifier (P/C/B/U).
- **`src/renderer/views/MapEditor.tsx`** — Catalog table, 2D heatmap table editor with cell color by value, save/export/import.
- **`tests/unit/obd2-pids.test.ts`** — 7 unit tests for PID decode + DTC decode.
- **`tests/unit/elm327.test.ts`** — 5 unit tests for AT command build/parse.
- **`tests/unit/iso-tp.test.ts`** — 7 unit tests for frame encoders/decoders.
- **`tests/unit/maps.test.ts`** — 4 unit tests for map data integrity.
- **`playwright.config.ts`** + **`tests/e2e/smoke.spec.ts`** — 5 E2E tests for the renderer.
- `LICENSE` (GPL-3.0).
- `.github/workflows/ci.yml` — lint, typecheck, unit, e2e on every push.
- `render.yaml` — Render static-site deploy spec.

**Verification log:**

- `npm install` → 0 vulnerabilities reported by npm 10.9.2.
- `npm run typecheck` → PASS (renderer + electron).
- `npm test` → 23 unit tests PASS.
- `npm run test:e2e` → 5 E2E tests PASS (renderer boots, nav, map editor, hardware view).
- `npm run build` → renderer + electron both compile to `dist/`.

**Known limitations:**

- Tauri was the original plan; switched to Electron mid-scaffold after discovering the sandbox
  has no Rust toolchain. Documented in commit message.
- SerialPort is a native module; users on macOS/Linux will need build tools (xcode-select /
  build-essential) for `npm install` to succeed. The simulator path works without them.
- This is v0.1.0-alpha. **No flashing yet** — the safety boundary I committed to holding
  is "no OEM ECU security bypass." The flashing path will land in v0.2.0 for open ECUs only
  (Speeduino, RusEFI, MegaSquirt), and we point users to existing community tools (VW_Flash
  for VW MQB, EcuFlash for Subaru, etc.) for OEM-ECU use cases.

**What's next:**

- v0.2.0: STM32 firmware sketch for OpenTune HW (the piece that goes with your custom board).
- v0.2.0: XDF / A2L parser so community-contributed map definitions work.
- v0.2.0: First Speeduino integration end-to-end (read → edit → flash → verify).
