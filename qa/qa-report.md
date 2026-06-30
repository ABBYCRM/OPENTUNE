# OPENTUNE — QA Inspection Report

**Target:** https://opentune-2tec.onrender.com
**Date:** 2026-06-30T21:50:01.331Z
**Viewports:** 1280x800, 768x1024, 375x812
**Pages crawled:** 6 × 3 = 18

## 📊 Summary

| Severity | Count |
|---|---|
| 🔴 Critical | 3 |
| 🟠 High     | 3 |
| 🟡 Medium   | 12 |
| 🟢 Low      | 0 |
| **Total**   | **18** |

## 📐 Viewport: desktop

| Severity | Category | Message |
|---|---|---|
| 🟡 medium | console | Console error: TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066 |
| 🟠 high | console | Uncaught exception: Cannot read properties of undefined (reading 'datalog') |
| 🟡 medium | navigation | Could not click nav "Diagnostics (DTCs)": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Diagnostics (DTCs)' }).first()
 |
| 🟡 medium | navigation | Could not click nav "Datalog": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Datalog' }).first()
 |
| 🟡 medium | navigation | Could not click nav "Map Editor": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Map Editor' }).first()
 |
| 🔴 critical | crash | Desktop crawl crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Connect' })
 |

## 📐 Viewport: tablet

| Severity | Category | Message |
|---|---|---|
| 🟡 medium | console | Console error: TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066 |
| 🟠 high | console | Uncaught exception: Cannot read properties of undefined (reading 'datalog') |
| 🟡 medium | navigation | Could not click nav "Diagnostics (DTCs)": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Diagnostics (DTCs)' }).first()
 |
| 🟡 medium | navigation | Could not click nav "Datalog": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Datalog' }).first()
 |
| 🟡 medium | navigation | Could not click nav "Map Editor": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Map Editor' }).first()
 |
| 🔴 critical | crash | Tablet crawl crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Connect' })
 |

## 📐 Viewport: mobile

| Severity | Category | Message |
|---|---|---|
| 🟡 medium | console | Console error: TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066 |
| 🟠 high | console | Uncaught exception: Cannot read properties of undefined (reading 'datalog') |
| 🟡 medium | navigation | Could not click nav "Diagnostics (DTCs)": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Diagnostics (DTCs)' }).first()
 |
| 🟡 medium | navigation | Could not click nav "Datalog": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Datalog' }).first()
 |
| 🟡 medium | navigation | Could not click nav "Map Editor": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Map Editor' }).first()
 |
| 🔴 critical | crash | Mobile crawl crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Connect' })
 |

## 💻 Console Output (full)

- [error] [desktop @1280x800] TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
- [error] [tablet @768x1024] TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
- [error] [mobile @375x812] TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066

## 🌐 Network (full)

- GET https://opentune-2tec.onrender.com/ → 200 [desktop @1280x800]
- GET https://opentune-2tec.onrender.com/assets/index-D8AkWjrL.css → 200 [desktop @1280x800]
- GET https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js → 200 [desktop @1280x800]
- GET https://opentune-2tec.onrender.com/ → 200 [tablet @768x1024]
- GET https://opentune-2tec.onrender.com/assets/index-D8AkWjrL.css → 200 [tablet @768x1024]
- GET https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js → 200 [tablet @768x1024]
- GET https://opentune-2tec.onrender.com/ → 200 [mobile @375x812]
- GET https://opentune-2tec.onrender.com/assets/index-D8AkWjrL.css → 200 [mobile @375x812]
- GET https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js → 200 [mobile @375x812]

## 💥 Page exceptions captured

```
[desktop @1280x800] TypeError: Cannot read properties of undefined (reading 'datalog')
TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
```
```
[tablet @768x1024] TypeError: Cannot read properties of undefined (reading 'datalog')
TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
```
```
[mobile @375x812] TypeError: Cannot read properties of undefined (reading 'datalog')
TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
```

## 🔧 Recommended fixes (ranked by severity)

1. **CRITICAL** [crash] Desktop crawl crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Connect' })

1. **CRITICAL** [crash] Tablet crawl crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Connect' })

1. **CRITICAL** [crash] Mobile crawl crashed: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Connect' })

1. **HIGH** [console] Uncaught exception: Cannot read properties of undefined (reading 'datalog')
1. **HIGH** [console] Uncaught exception: Cannot read properties of undefined (reading 'datalog')
1. **HIGH** [console] Uncaught exception: Cannot read properties of undefined (reading 'datalog')
1. **MEDIUM** [console] Console error: TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
1. **MEDIUM** [navigation] Could not click nav "Diagnostics (DTCs)": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Diagnostics (DTCs)' }).first()

1. **MEDIUM** [navigation] Could not click nav "Datalog": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Datalog' }).first()

1. **MEDIUM** [navigation] Could not click nav "Map Editor": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Map Editor' }).first()

1. **MEDIUM** [console] Console error: TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
1. **MEDIUM** [navigation] Could not click nav "Diagnostics (DTCs)": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Diagnostics (DTCs)' }).first()

1. **MEDIUM** [navigation] Could not click nav "Datalog": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Datalog' }).first()

1. **MEDIUM** [navigation] Could not click nav "Map Editor": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Map Editor' }).first()

1. **MEDIUM** [console] Console error: TypeError: Cannot read properties of undefined (reading 'datalog')
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:58150
    at pl (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:24177)
    at bt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:42076)
    at Ef (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:40929)
    at xt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:39990)
    at Bu (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:36666)
    at vt (https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:38:3258)
    at https://opentune-2tec.onrender.com/assets/index-DI78-oD-.js:40:34066
1. **MEDIUM** [navigation] Could not click nav "Diagnostics (DTCs)": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Diagnostics (DTCs)' }).first()

1. **MEDIUM** [navigation] Could not click nav "Datalog": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Datalog' }).first()

1. **MEDIUM** [navigation] Could not click nav "Map Editor": locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.nav-item').filter({ hasText: 'Map Editor' }).first()

