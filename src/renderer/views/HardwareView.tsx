import React from 'react';

export default function HardwareView() {
  return (
    <div>
      <h1>Hardware — OpenTune HW Reference</h1>
      <p>This is the spec for the custom hardware interface you'll build. The OPENTUNE software
      talks to it over USB-CDC using a simple JSON-over-serial protocol.</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Spec (Rev 0.1)</h2>
        <table>
          <tbody>
            <tr><th>Host link</th><td>USB-CDC (appears as /dev/ttyACM0 on Linux, COMx on Windows)</td></tr>
            <tr><th>Baud</th><td>921600 (or any — CDC ignores baud)</td></tr>
            <tr><th>Bus</th><td>CAN 2.0B (ISO 11898), optional CAN-FD</td></tr>
            <tr><th>Transceiver</th><td>External (SN65HVD230, TJA1050, or TJA1043 for FD)</td></tr>
            <tr><th>GPIOs</th><td>1× ECU boot-mode pin, 1× ECU reset pin, 1× LED, 1× button</td></tr>
            <tr><th>Voltage</th><td>12V from OBD-II pin 6 → 5V/3.3V LDO</td></tr>
            <tr><th>Form factor</th><td>OBD-II plug that lives in the port, OR bench breakout</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>MCU candidates</h2>
        <table>
          <thead><tr><th>MCU</th><th>CAN</th><th>USB</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>STM32F405 / F407</td><td>bxCAN</td><td>USB-FS</td><td>Best price/perf, tons of examples</td></tr>
            <tr><td>STM32H723 / H730</td><td>FDCAN</td><td>USB-FS</td><td>CAN-FD ready, fast</td></tr>
            <tr><td>ESP32-S3</td><td>TWAI</td><td>USB-CDC</td><td>Cheap, WiFi/BLE bonus, slower CAN</td></tr>
            <tr><td>RP2040 + MCP2515</td><td>SPI→MCP2515</td><td>USB</td><td>Cheapest, but extra chip</td></tr>
            <tr><td>Teensy 4.1</td><td>FlexCAN</td><td>USB-HS</td><td>Fastest, $$$</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Protocol (host ↔ device)</h2>
        <p>Line-based, one JSON object per line, LF terminated. Request/response correlation by <code>id</code> field.</p>
        <pre style={{ background: 'var(--bg-2)', padding: 12, borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 12, overflow: 'auto' }}>
{`# Init
→ {"id":1,"op":"hello","fw":"opentune-hw-0.1","caps":["can","kline","boot"]}
← {"id":1,"ok":true,"fw":"opentune-hw-0.1","caps":["can","kline","boot"]}

# Open CAN at 500kbps
→ {"id":2,"op":"can_open","bitrate":500000}
← {"id":2,"ok":true,"bitrate":500000}

# Send UDS request (CAN ID 0x7E0 → 0x7E8 ECU)
→ {"id":3,"op":"can_send","id":2016,"ext":false,"data":[2,1,12],"timeout_ms":1000}
← {"id":3,"ok":true,"id":2016,"data":[4,65,12,26,248]}

# Drive boot pin
→ {"id":4,"op":"gpio","boot":true,"reset":true,"hold_ms":50}
← {"id":4,"ok":true}

# Stream subscription (one-way, no id)
→ {"op":"sub","what":"can"}
← {"ts":1234,"id":2016,"data":[2,1,12]}
← {"ts":1235,"id":2016,"data":[3,65,12,26]}
...`}
        </pre>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>What ships in this repo</h2>
        <p>The <code>opentune-hw</code> transport in the software uses this exact protocol. The
        firmware sketch (STM32CubeIDE / ESP-IDF / PlatformIO compatible) will be added in
        <code> firmware/ </code> in a follow-up push — say the word and I'll write it next.</p>
      </div>
    </div>
  );
}
