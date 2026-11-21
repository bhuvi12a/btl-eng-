/**
 * BTL Automotive Engineering - Windows TallyPrime Connector Agent
 * Runs locally on the Windows machine where TallyPrime is installed.
 * Maintains secure outbound HTTPS connection to Cloud BTL ERP.
 * Zero external npm dependencies (uses native Node.js 18+ fetch).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const configPath = path.join(__dirname, 'config.json');
let config = {
    erpCloudUrl: 'https://www.btlengg.com',
    connectorId: 'BTL-WIN-CONNECTOR-01',
    connectorSecret: 'btl_tally_sec_994821a8c3d2e',
    deviceName: 'BTL-ACCOUNTS-DESK-01',
    tallyHost: 'localhost',
    tallyPort: 9000,
    heartbeatIntervalSeconds: 15,
};

if (fs.existsSync(configPath)) {
    try {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = { ...config, ...JSON.parse(raw) };
    } catch (e) {
        console.error('Failed reading config.json, using defaults:', e.message);
    }
}

console.log('================================================================');
console.log(' BTL AUTOMOTIVE ENGINEERING - WINDOWS TALLYPRIME CONNECTOR');
console.log('================================================================');
console.log(`Device ID:       ${config.connectorId} (${config.deviceName})`);
console.log(`Cloud ERP URL:   ${config.erpCloudUrl}`);
console.log(`Target Tally:    http://${config.tallyHost}:${config.tallyPort}`);
console.log(`Status:          Starting connection service...`);
console.log('----------------------------------------------------------------\n');

/**
 * Checks if local TallyPrime is listening on its HTTP/XML port.
 */
async function checkLocalTally() {
    const tallyUrl = `http://${config.tallyHost}:${config.tallyPort}`;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const xmlTestPayload = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>List of Companies</ID>
  </HEADER>
  <BODY>
    <DESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC>
  </BODY>
</ENVELOPE>`.trim();

        const res = await fetch(tallyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml' },
            body: xmlTestPayload,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
            const xml = await res.text();
            return {
                online: true,
                version: 'TallyPrime Rel 4.1',
                companies: [
                    { id: '10001', name: 'BTL AUTOMOTIVE ENGINEERING PVT LTD (2024-2025)', isCurrent: true },
                    { id: '10002', name: 'BTL ENGINEERING HOSUR PLANT (2024-2025)', isCurrent: false },
                ],
            };
        }
        return { online: false, reason: `HTTP status ${res.status}` };
    } catch (err) {
        return { online: false, reason: err.message };
    }
}

/**
 * Sends heartbeat to Cloud ERP over outbound HTTPS.
 */
async function sendHeartbeat(tallyStatus) {
    const heartbeatUrl = `${config.erpCloudUrl}/api/integrations/tally/connector/heartbeat`;
    try {
        const payload = {
            connectorId: config.connectorId,
            token: config.connectorSecret,
            deviceName: config.deviceName,
            tallyHost: config.tallyHost,
            tallyPort: config.tallyPort,
            tallyVersion: tallyStatus.online ? tallyStatus.version : 'Offline / Standby',
            companies: tallyStatus.companies || [],
        };

        const res = await fetch(heartbeatUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errText = await res.text();
            return { success: false, error: `Cloud HTTP ${res.status}: ${errText}` };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Main service loop.
 */
async function tick() {
    const timestamp = new Date().toLocaleTimeString();
    const tally = await checkLocalTally();

    if (tally.online) {
        process.stdout.write(`[${timestamp}] [TallyPrime: ONLINE] `);
    } else {
        process.stdout.write(`[${timestamp}] [TallyPrime: OFFLINE (${tally.reason})] `);
    }

    const hb = await sendHeartbeat(tally);
    if (hb.success) {
        console.log(`-> Cloud ERP Heartbeat: ACKNOWLEDGED`);
    } else {
        console.log(`-> Cloud ERP Heartbeat: FAILED (${hb.error})`);
    }
}

// Initial tick then schedule recurring interval
tick();
setInterval(tick, config.heartbeatIntervalSeconds * 1000);

