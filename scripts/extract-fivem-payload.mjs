import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = fs.readFileSync(path.join(root, "fivem-ac-monitor/server.mjs"), "utf8")
const start = src.indexOf("const STREAM_URL")
const end = src.indexOf("function requireAuth")
const body = src.slice(start, end)

const header = `import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'fivem-ac-monitor');
const execFileAsync = promisify(execFile);

function dataPath(file) {
  return path.join(DATA_DIR, file);
}

`

const patched = body.replace(/path\.join\(__dirname, file\)/g, "dataPath(file)")

const footer = `
function emptyErrorPayload(message) {
  const programs = readJsonSafe('programs.json', { programs: [] });
  return {
    fetchedAt: new Date().toISOString(),
    stats: { totalServers: 0, totalPlayers: 0, activeServers: 0, gta5Instances: 0 },
    systemStatus: programSummary(programs),
    servers: [],
    stale: true,
    error: message,
  };
}

export function resetPayloadCache() {
  cache = { at: 0, payload: null, loading: null };
  backgroundRefresh = null;
}

export { getPayload, buildPayload, emptyErrorPayload, programSummary, BROWSER_HEADERS };
`

const outDir = path.join(root, "lib/fivem-monitor")
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, "payload-service.mjs"), header + patched + footer)
console.log("OK:", path.join(outDir, "payload-service.mjs"))
