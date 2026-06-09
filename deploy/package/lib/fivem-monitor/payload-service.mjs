import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'fivem-ac-monitor');
const execFileAsync = promisify(execFile);

function dataPath(file) {
  return path.join(DATA_DIR, file);
}

const STREAM_URL = 'https://servers-frontend.fivem.net/api/servers/streamRedir';
const SINGLE = (id) => `https://servers-frontend.fivem.net/api/servers/single/${id}`;
const CACHE_FILE = 'fivem-cache.json';
const SEED_FILE = 'thailand-seed.json';
const USERS_FILE = 'users.json';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const BROWSER_HEADERS = {
  'User-Agent': UA,
  Referer: 'https://servers.fivem.net/',
  Origin: 'https://servers.fivem.net',
  'Accept-Language': 'en-US,en;q=0.9,th;q=0.8',
};

const CACHE_TTL_MS = 300_000;
const BATCH = 56;
const BATCH_DELAY_MS = 0;
const STREAM_FETCH_MS = Number(process.env.FIVEM_STREAM_MS) || 7500;
const SINGLE_FETCH_MS = Number(process.env.FIVEM_SINGLE_MS) || 5000;
const SEED_URL_MS = Number(process.env.FIVEM_SEED_URL_MS) || 3500;
const DEMOXP_PROXY_URL = 'https://www.demoxshop.com/api_proxy.php?locale=th-TH';
const DEMOXP_FETCH_MS = Number(process.env.DEMOXP_FETCH_MS) || 25000;

let remoteSeedCache = { at: 0, endpoints: [] };

let cache = { at: 0, payload: null, loading: null };
let backgroundRefresh = null;

function readJsonSafe(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(dataPath(file), 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonSafe(file, data) {
  fs.writeFileSync(dataPath(file), JSON.stringify(data, null, 2), 'utf8');
}

function loadPayloadCache() {
  const c = readJsonSafe(CACHE_FILE, null);
  if (!c || !Array.isArray(c.servers) || c.servers.length === 0) return null;
  return {
    fetchedAt: c.fetchedAt,
    stats: c.stats,
    systemStatus: c.systemStatus,
    servers: c.servers,
  };
}

function savePayloadCache(payload) {
  try {
    writeJsonSafe(CACHE_FILE, {
      fetchedAt: payload.fetchedAt,
      stats: payload.stats,
      systemStatus: payload.systemStatus,
      servers: payload.servers,
    });
  } catch (e) {
    console.warn('savePayloadCache', e.message);
  }
}

function loadUsers() {
  const raw = readJsonSafe(USERS_FILE, { users: {} });
  return raw.users && typeof raw.users === 'object' ? raw.users : {};
}

function saveUsers(users) {
  writeJsonSafe(USERS_FILE, { users });
}

function logActivity(action, username, details) {
  try {
    const file = 'activity.json';
    const data = readJsonSafe(file, { logs: [] });
    data.logs.unshift({ time: new Date().toISOString(), action, username, details });
    if (data.logs.length > 300) data.logs.length = 300;
    writeJsonSafe(file, data);
  } catch (e) {}
}

function loadSeedEndpoints() {
  const raw = readJsonSafe(SEED_FILE, { endpoints: [] });
  const arr = raw.endpoints || raw.ids || [];
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.filter((x) => typeof x === 'string' && /^[a-z0-9]{6}$/.test(x)))];
}

function saveSeedEndpoints(endpoints) {
  const prev = loadSeedEndpoints();
  const merged = [...new Set([...prev, ...endpoints])];
  try {
    writeJsonSafe(SEED_FILE, { endpoints: merged });
  } catch (e) {
    console.warn('saveSeedEndpoints', e.message);
  }
}

async function loadRemoteSeedEndpoints() {
  const url = process.env.FIVEM_SEED_URL;
  if (!url) return [];
  const now = Date.now();
  if (remoteSeedCache.at && now - remoteSeedCache.at < 300_000 && remoteSeedCache.endpoints.length) {
    return remoteSeedCache.endpoints;
  }
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), SEED_URL_MS);
    try {
      const res = await fetch(url, {
        headers: { ...BROWSER_HEADERS, Accept: 'application/json' },
        signal: ac.signal,
      });
      clearTimeout(to);
      if (!res.ok) return [];
      const j = await res.json();
      const arr = Array.isArray(j) ? j : j.endpoints || j.ids || [];
      const eps = arr.filter((x) => typeof x === 'string' && /^[a-z0-9]{6}$/.test(x));
      remoteSeedCache = { at: now, endpoints: eps };
      return eps;
    } finally {
      clearTimeout(to);
    }
  } catch {
    return [];
  }
}

/** ดึงรหัส endpoint 6 ตัวก่อนตำแหน่งที่พบ pattern ในสตรีม */
function extractEndpointIdsNearPattern(buf, patternAscii) {
  const needle = Buffer.from(patternAscii, 'ascii');
  const ids = [];
  let pos = 0;
  while (true) {
    const idx = buf.indexOf(needle, pos);
    if (idx < 0) break;
    const start = Math.max(0, idx - 3000);
    const slice = buf.subarray(start, idx);
    let found = null;
    for (let i = slice.length - 10; i >= 0; i--) {
      if (slice[i] === 0x0a && slice[i + 1] === 0x06) {
        const str = slice.subarray(i + 2, i + 8).toString('ascii');
        if (/^[a-z0-9]{6}$/.test(str) && /[0-9]/.test(str)) {
          found = str;
          break;
        }
      }
    }
    if (found) ids.push(found);
    pos = idx + Math.max(1, needle.length);
  }
  return ids;
}

/** รวมหลาย pattern ที่มักปรากฏในเซิร์ฟไทย */
function extractThailandEndpointIdsFromStream(buf) {
  const patterns = ['th-TH', 'thailand', 'fivemthailand', 'Thailand'];
  const all = [];
  for (const p of patterns) {
    all.push(...extractEndpointIdsNearPattern(buf, p));
  }
  return [...new Set(all)];
}

function stripFiveMColorCodes(s) {
  if (!s) return '';
  return s.replace(/\^[0-9]/g, '').replace(/&[0-9a-fA-F]/g, '').trim();
}

const GHOSTX_SERVERS = [
    'private city', 'test town', 'next community', 'flex city',
    'universe city', 'secret x school', 'naifhun town', '4king epic',
    '4king x school', '4king socute', 'taste d school', 'ranverse x school',
    'passion community', 'timetown', 'ai city', 'bangsaen city',
    'playcommunity', 'xoxo town', 'warp town', 'lnwza story',
    'kirby town', 'versepunk academy', 'assist town', 'family city',
    'fam unity', 'wip town', 'los reborn', 'galaxy town',
    'chomkaen', 'god story', 'nine city', 'ace city',
    'atlas city', 'crybaby x school', 'lava town', 'one city',
    'sea city', 'munchkin town', 'fresh town', 'try town',
    'moggy country', 'luxu city', 'genz x school', 'darling community',
    'build city', 'plus town', 'hypertown', 'ไฮเปอร์ทาว', 'king socute',
    'ไพรเวท', 'ม็อกกี้', 'heavy city', 'kitty cat',
    'byou', 'what space', 'why city', 'สดใหม่',
    'bkk city', 'what universal', 'gambet school', 'familie city',
    'มัชกิ้น', 'bit', 'wanted city', 'boom & what',
    'aura city', 'awang community', '64bit', 'grand city',
    'half city', 'ลักซ์ซู', 'โซโซทาวน์', 'extreme community',
    'car city', 'nova', 'คิ้วท์ทาวน์', 'bestie school',
    "4king's x school", 'กู๊ดทาวน์', 'bubbu', 'downtown',
    'duck school', 'tiger server', 'silver city', 'metoo town',
    'not', 'villain genz'
];

const CRCBOY_SERVERS = ['lc 1', 'star town', 'commu2', 'st 2.0'];
const LAUNCHER_SERVERS = ['luv town'];
const OWNAC_SERVERS = ['เอ็กดีโฟคิง'];
const NOAC_SERVERS = ['commu1'];

const AC_RULES = [
  { re: /ghostx|ghost\s*-?\s*x/i, text: 'GHOSTX', badge: 'ghostx' },
  { re: /(^|[,\s\/|])bt([\s_-]?(ac|shield|antibot))?($|[,\s\/|])/i, text: 'BT', badge: 'bt' },
  { re: /(^|[,\s\/|])nc([\s_-]?(ac|shield|antibot))?($|[,\s\/|])/i, text: 'NC', badge: 'nc' },
  { re: /crcbot|crc_bot|crc[-_]?bot/i, text: 'CRCBOT', badge: 'crc' },
  { re: /finiac|fini_ac/i, text: 'FiniAC', badge: 'fini' },
  { re: /waveshield|wave_shield/i, text: 'WaveShield', badge: 'wave' },
  { re: /fiveguard|five_guard/i, text: 'Fiveguard', badge: 'fiveguard' },
  { re: /pegasus|pegasusac/i, text: 'Pegasus', badge: 'pegasus' },
  { re: /electronac|electron_ac/i, text: 'ElectronAC', badge: 'electron' },
  { re: /titanac|titan_ac/i, text: 'TitanAC', badge: 'titan' },
  { re: /secureserve|secure_serve/i, text: 'SecureServe', badge: 'secure' },
];

function detectAcBadge(data) {
  const vars = data.vars || {};
  const resources = (data.resources || []).join(' ');
  const hay = [
    resources,
    vars.tags,
    data.hostname,
    vars.sv_projectName,
    vars.sv_projectDesc,
  ]
    .filter(Boolean)
    .join(' ');
    
  const checkName = (vars.sv_projectName || data.hostname || '').toLowerCase();
  
  if (GHOSTX_SERVERS.some(k => checkName.includes(k))) return { type: 'ghostx', text: 'GHOSTX' };
  if (CRCBOY_SERVERS.some(k => checkName.includes(k))) return { type: 'crc', text: 'CRCBOY' };
  if (LAUNCHER_SERVERS.some(k => checkName.includes(k))) return { type: 'launcher', text: 'Launcher' };
  if (OWNAC_SERVERS.some(k => checkName.includes(k))) return { type: 'ac-tool', text: 'กันโปรของตัวเอง' };
  if (NOAC_SERVERS.some(k => checkName.includes(k))) return { type: 'no-ac', text: 'ไม่มีระบบ Anti-Cheat' };

  for (const rule of AC_RULES) {
    if (rule.re.test(hay)) {
      return { type: rule.badge, text: rule.text };
    }
  }

  const tagParts = (vars.tags || '')
    .toLowerCase()
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (tagParts.some((p) => p === 'ghostx' || p.startsWith('ghostx'))) {
    return { type: 'ghostx', text: 'GHOSTX' };
  }
  if (tagParts.some((p) => p === 'nc' || p.startsWith('nc-') || p === 'nc ac')) {
    return { type: 'nc', text: 'NC' };
  }
  if (tagParts.some((p) => p === 'bt' || p.startsWith('bt-') || p === 'bt ac')) {
    return { type: 'bt', text: 'BT' };
  }

  const resL = resources.toLowerCase();
  if (/ghostx/i.test(resL)) {
    return { type: 'ghostx', text: 'GHOSTX' };
  }
  if (/nc[-_]?(ac|antibot|shield)|(^|[\/_-])nc([\/_-]|$)/i.test(resL)) {
    return { type: 'nc', text: 'NC' };
  }
  if (/bt[-_]?(ac|antibot|shield)|(^|[\/_-])bt([\/_-]|$)/i.test(resL)) {
    return { type: 'bt', text: 'BT' };
  }

  if (/\blauncher\b/i.test(hay)) {
    return { type: 'launcher', text: 'Launcher' };
  }
  return { type: 'no-ac', text: 'ไม่พบ Anti-Cheat' };
}

const FIVEM_ICON_BASE = 'https://servers-frontend.fivem.net/api/servers/icon';

function iconUrl(endpoint, iconVersion) {
  if (iconVersion == null || iconVersion === '') return null;
  const v = String(iconVersion).replace(/\.png$/i, '');
  return `${FIVEM_ICON_BASE}/${encodeURIComponent(endpoint)}/${encodeURIComponent(v)}.png`;
}

function isThailandServer(d) {
  const v = d.vars || {};
  const locale = (v.locale || '').toLowerCase();
  if (locale === 'th-th') return true;
  const tags = (v.tags || '').toLowerCase();
  const blob = `${tags} ${d.hostname || ''} ${v.sv_projectName || ''} ${v.sv_projectDesc || ''}`.toLowerCase();
  if (tags.includes('thailand') || tags.includes('fivemthailand') || tags.includes('th-th')) return true;
  if (blob.includes('thailand') || blob.includes('fivemthailand')) return true;
  if (/[\u0E00-\u0E7F]/.test(d.hostname || '') || /[\u0E00-\u0E7F]/.test(v.sv_projectName || '')) return true;
  return false;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchStreamViaCurl(extraArgs = []) {
  const args = [
    '-sS',
    '-L',
    '--http1.1',
    '--compressed',
    '-H',
    `User-Agent: ${UA}`,
    '-H',
    'Referer: https://servers.fivem.net/',
    '-H',
    'Accept: */*',
    '-H',
    'Accept-Language: en-US,en;q=0.9',
    ...extraArgs,
    STREAM_URL,
  ];
  const { stdout } = await execFileAsync('curl', args, {
    maxBuffer: 80 * 1024 * 1024,
    encoding: 'buffer',
    windowsHide: true,
  });
  return stdout;
}

async function fetchStreamViaPowerShell() {
  const tmp = path.join(os.tmpdir(), `fivem-stream-${Date.now()}.bin`);
  const safeTmp = tmp.replace(/'/g, "''");
  const ps = [
    '-NoProfile',
    '-Command',
    `Invoke-WebRequest -Uri '${STREAM_URL}' -OutFile '${safeTmp}' -UseBasicParsing -Headers @{'User-Agent'='${UA}';'Referer'='https://servers.fivem.net/'}`,
  ];
  await execFileAsync('powershell', ps, { windowsHide: true, maxBuffer: 1024 * 1024 });
  const buf = fs.readFileSync(tmp);
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ignore */
  }
  return buf;
}

async function fetchStreamBuffer() {
  const headerSets = [
    {
      ...BROWSER_HEADERS,
      Accept: '*/*',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
    },
    {
      'User-Agent': UA,
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://servers.fivem.net/',
    },
  ];
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), STREAM_FETCH_MS);
  try {
    for (const headers of headerSets) {
      try {
        const res = await fetch(STREAM_URL, {
          headers,
          redirect: 'follow',
          signal: ac.signal,
        });
        const buf = Buffer.from(await res.arrayBuffer());
        if (res.ok && buf.length > 50_000) return buf;
      } catch {
        /* next */
      }
    }
  } finally {
    clearTimeout(to);
  }

  if (process.env.FIVEM_STREAM_EXTRA === '1') {
    const curlTries = [[], ['--no-compressed']];
    for (const extra of curlTries) {
      try {
        const buf = await fetchStreamViaCurl(extra);
        if (buf.length > 50_000) return buf;
      } catch {
        /* ignore */
      }
    }
    if (process.env.FIVEM_STREAM_POWERSHELL === '1') {
      try {
        const buf = await fetchStreamViaPowerShell();
        if (buf.length > 50_000) return buf;
      } catch {
        /* ignore */
      }
    }
  }
  throw new Error('stream_blocked');
}

async function fetchJson(url) {
  const headers = {
    ...BROWSER_HEADERS,
    Accept: 'application/json',
  };

  async function once() {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), SINGLE_FETCH_MS);
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: ac.signal });
      clearTimeout(to);
      return res;
    } catch (e) {
      clearTimeout(to);
      throw e;
    }
  }

  let res = await once();
  if (res.status === 429 || res.status === 503) {
    await sleep(180);
    res = await once();
  }
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function mapFivemDataToServer(endpoint, d, options = {}) {
  const { trustSeed, seedSet, skipThailandCheck } = options;
  if (!d) return null;
  const inSeed = seedSet && seedSet.has(endpoint);
  if (!skipThailandCheck) {
    if (!trustSeed || !inSeed) {
      if (!isThailandServer(d)) return null;
    }
  }

  const vars = d.vars || {};
  const hostname = stripFiveMColorCodes(d.hostname || vars.sv_projectName || endpoint);
  const sub = [vars.sv_projectDesc, vars.tags].filter(Boolean).join(' · ');
  const badge = detectAcBadge(d);
  const iv = d.iconVersion;

  return {
    endpoint,
    name: hostname.slice(0, 120) || endpoint,
    sub: stripFiveMColorCodes(sub).slice(0, 200),
    players: Number(d.clients) || 0,
    maxPlayers: Number(d.sv_maxclients ?? d.svMaxclients ?? vars.sv_maxClients) || 0,
    gametype: d.gametype || '',
    badge,
    connect: `https://cfx.re/join/${endpoint}`,
    icon: iconUrl(endpoint, iv),
    resourcesCount: (d.resources && d.resources.length) || 0,
  };
}

async function fetchDemoxshopThailandServers() {
  const headers = {
    ...BROWSER_HEADERS,
    Accept: 'application/json, */*',
    Referer: 'https://www.demoxshop.com/?page=antibot',
  };
  delete headers.Origin;
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), DEMOXP_FETCH_MS);
  try {
    const res = await fetch(DEMOXP_PROXY_URL, {
      headers,
      redirect: 'follow',
      signal: ac.signal,
    });
    clearTimeout(to);
    if (!res.ok) throw new Error(`demox ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('demox invalid json');
    const out = [];
    for (const row of data) {
      const endpoint = row.EndPoint || row.endPoint;
      const d = row.Data;
      if (!endpoint || !d || typeof endpoint !== 'string') continue;
      const s = mapFivemDataToServer(endpoint, d, { skipThailandCheck: true });
      if (s) out.push(s);
    }
    return out;
  } catch (e) {
    clearTimeout(to);
    throw e;
  }
}

async function fetchSingleDetails(endpoint, options = {}) {
  try {
    const j = await fetchJson(SINGLE(endpoint));
    const d = j.Data;
    if (!d) return null;
    return mapFivemDataToServer(endpoint, d, options);
  } catch {
    return null;
  }
}

async function fetchAllDetails(ids, fetchOpts = {}) {
  const out = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const part = await Promise.all(chunk.map((id) => fetchSingleDetails(id, fetchOpts)));
    for (const row of part) {
      if (row) out.push(row);
    }
    if (i + BATCH < ids.length) await sleep(BATCH_DELAY_MS);
  }
  return out;
}

function applyOverrides(servers, overridesMap) {
  if (!overridesMap || typeof overridesMap !== 'object') return servers;
  return servers.map((s) => {
    const o = overridesMap[s.endpoint];
    if (!o || !o.badge) return s;
    return {
      ...s,
      badge: {
        type: o.badge.type || s.badge.type,
        text: o.badge.text || s.badge.text,
      },
    };
  });
}

function computeStats(servers) {
  const totalPlayers = servers.reduce((a, s) => a + (s.players || 0), 0);
  const active = servers.filter((s) => s.players > 0).length;
  return {
    totalServers: servers.length,
    totalPlayers,
    activeServers: active,
    gta5Instances: servers.length,
  };
}

function programSummary(programs) {
  const list = programs.programs || [];
  let undetected = 0;
  let warning = 0;
  let stop = 0;
  for (const p of list) {
    const st = (p.status || 'undetected').toLowerCase();
    if (st === 'undetected') undetected++;
    else if (st === 'warning') warning++;
    else if (st === 'stop' || st === 'stopped') stop++;
  }
  return { undetected, warning, stop, programs: list };
}

function assemblePayload(servers, stale, cacheWarning, options = {}) {
  const { mergeSeed = true } = options;
  if (mergeSeed) {
    saveSeedEndpoints(servers.map((s) => s.endpoint));
  }
  const overridesFile = readJsonSafe('ac-overrides.json', { overrides: {} });
  const srv = applyOverrides(servers, overridesFile.overrides || {});
  const programs = readJsonSafe('programs.json', { programs: [] });
  const stats = computeStats(srv);
  const prog = programSummary(programs);
  const payload = {
    fetchedAt: new Date().toISOString(),
    stats,
    systemStatus: prog,
    servers: srv,
    stale,
  };
  if (cacheWarning) payload.cacheWarning = cacheWarning;
  savePayloadCache(payload);
  return payload;
}

async function buildPayload() {
  const useDemox = process.env.DEMOX_SHOP_PROXY !== '0' && process.env.DEMOX_SHOP_PROXY !== 'false';
  const mergeExtra =
    useDemox && process.env.DEMOX_MERGE_STREAM !== '0' && process.env.DEMOX_MERGE_STREAM !== 'false';

  const seedLocal = loadSeedEndpoints();
  const seedRemote = await loadRemoteSeedEndpoints();
  const seedCount = seedLocal.length + seedRemote.length;
  const seedSet = new Set([...seedLocal, ...seedRemote]);

  const skipStreamLegacy = seedCount > 0 && process.env.FIVEM_ALWAYS_TRY_STREAM !== '1';
  const trustSeed = skipStreamLegacy && seedCount > 0;

  const needStreamBuf = mergeExtra || !skipStreamLegacy;
  const [demoxServers, buf] = await Promise.all([
    useDemox ? fetchDemoxshopThailandServers().catch(() => []) : Promise.resolve([]),
    needStreamBuf ? fetchStreamBuffer().catch(() => null) : Promise.resolve(null),
  ]);

  const streamOk = Boolean(buf && buf.length > 50_000);
  let streamIds = [];
  if (buf && buf.length > 50_000) {
    const probe = buf.toString('binary');
    if (
      probe.includes('th-TH') ||
      probe.includes('thailand') ||
      probe.includes('Thailand') ||
      probe.includes('fivemthailand') ||
      buf.length > 400_000
    ) {
      streamIds = extractThailandEndpointIdsFromStream(buf);
    }
  }

  const demoxMergeMaxRaw = Number(process.env.FIVEM_MERGE_EXTRA_MAX);
  const demoxMergeMax = Number.isFinite(demoxMergeMaxRaw)
    ? Math.min(2000, Math.max(0, demoxMergeMaxRaw))
    : 800;
  const capExtras = mergeExtra && demoxServers.length > 0 && demoxMergeMax > 0;

  const demoxSet = new Set(demoxServers.map((s) => s.endpoint));
  const orderedExtra = [];
  const seen = new Set();
  for (const id of streamIds) {
    if (!demoxSet.has(id) && !seen.has(id)) {
      seen.add(id);
      orderedExtra.push(id);
    }
  }
  for (const id of seedLocal) {
    if (!demoxSet.has(id) && !seen.has(id)) {
      seen.add(id);
      orderedExtra.push(id);
    }
  }
  for (const id of seedRemote) {
    if (!demoxSet.has(id) && !seen.has(id)) {
      seen.add(id);
      orderedExtra.push(id);
    }
  }

  const capped = capExtras ? orderedExtra.slice(0, demoxMergeMax) : orderedExtra;
  let extraServers = [];
  if (capped.length > 0) {
    extraServers = await fetchAllDetails(capped, { trustSeed, seedSet });
  }

  const merged = [...demoxServers, ...extraServers].filter(Boolean);
  merged.sort((a, b) => b.players - a.players);

  if (merged.length > 0) {
    const gotStreamIds = streamIds.length > 0;
    const stale = !streamOk || !gotStreamIds;
    let cacheWarning = '';
    if (mergeExtra && demoxServers.length > 0) {
      cacheWarning = ''; // "โหมดผสม: DEMOXSHOP + สตรีม/seed... " hidden per user request
    } else if (skipStreamLegacy && seedCount > 0 && !mergeExtra && streamIds.length === 0) {
      cacheWarning =
        'โหมดเร็ว (seed) — ตั้ง FIVEM_ALWAYS_TRY_STREAM=1 ถ้าต้องการผสมรายการจากสตรีม';
    } else if (stale && streamIds.length === 0 && demoxServers.length === 0) {
      cacheWarning =
        'ไม่ได้รับ master list จาก FiveM — ใช้รายการจาก seed/แคช (เพิ่มรหัสใน thailand-seed.json หรือแก้เครือข่าย/VPN จะได้รายชื่อครบขึ้น)';
    }
    const mergeSeedFlag =
      process.env.DEMOX_MERGE_SEED === '1' || process.env.DEMOX_MERGE_SEED === 'true';
    return assemblePayload(merged, stale, cacheWarning, { mergeSeed: mergeSeedFlag });
  }

  const ids = [...new Set([...streamIds, ...seedLocal, ...seedRemote])];

  if (ids.length === 0) {
    const cached = loadPayloadCache();
    if (cached) {
      return {
        ...cached,
        stale: true,
        cacheWarning:
          'ดึง master list ไม่ได้ และยังไม่มีรายการใน thailand-seed.json / FIVEM_SEED_URL — ใช้แคชล่าสุด',
      };
    }
    throw new Error(
      'ไม่มีรายการเซิร์ฟเวอร์ (ถูกบล็อก 403) — สร้างไฟล์ thailand-seed.json ใส่รหัสเซิร์ฟ หรือตั้งค่า FIVEM_SEED_URL เป็น URL ของ JSON ที่มี endpoints',
    );
  }

  let servers = await fetchAllDetails(ids, { trustSeed, seedSet });
  servers.sort((a, b) => b.players - a.players);

  const gotStreamIds = streamIds.length > 0;
  const stale = !streamOk || !gotStreamIds;

  let cacheWarning = '';
  if (skipStreamLegacy && ids.length > 0) {
    cacheWarning =
      'โหมดเร็ว (seed) — ตั้ง FIVEM_ALWAYS_TRY_STREAM=1 ถ้าต้องการผสมรายการจากสตรีม';
  } else if (stale && ids.length > 0) {
    cacheWarning =
      'ไม่ได้รับ master list จาก FiveM — ใช้รายการจาก seed/แคช (เพิ่มรหัสใน thailand-seed.json หรือแก้เครือข่าย/VPN จะได้รายชื่อครบขึ้น)';
  }
  return assemblePayload(servers, stale, cacheWarning);
}

async function getPayload() {
  const now = Date.now();
  if (cache.payload && now - cache.at < CACHE_TTL_MS) {
    return cache.payload;
  }
  if (cache.loading) {
    const diskBusy = loadPayloadCache();
    if (diskBusy) {
      return {
        ...diskBusy,
        stale: true,
        cacheWarning: 'แสดงจากแคช — กำลังอัปเดตรายการเซิร์ฟเวอร์...',
      };
    }
    return cache.loading;
  }

  if (cache.payload && now - cache.at >= CACHE_TTL_MS) {
    if (!backgroundRefresh) {
      backgroundRefresh = (async () => {
        try {
          const payload = await buildPayload();
          cache = { at: Date.now(), payload, loading: null };
        } catch (e) {
          if (process.env.FIVEM_DEBUG === '1') console.warn('background refresh', e.message);
        } finally {
          backgroundRefresh = null;
        }
      })();
    }
    return cache.payload;
  }

  const disk = loadPayloadCache();
  if (disk) {
    cache = {
      at: now,
      payload: {
        ...disk,
        stale: true,
        cacheWarning: 'แสดงจากแคชเซิร์ฟเวอร์ — กำลังอัปเดตเบื้องหลัง',
      },
      loading: null,
    };
    if (!backgroundRefresh) {
      backgroundRefresh = (async () => {
        try {
          const payload = await buildPayload();
          cache = { at: Date.now(), payload, loading: null };
        } catch (e) {
          if (process.env.FIVEM_DEBUG === '1') console.warn('background refresh', e.message);
        } finally {
          backgroundRefresh = null;
        }
      })();
    }
    return cache.payload;
  }

  cache.loading = (async () => {
    try {
      const payload = await buildPayload();
      cache = { at: Date.now(), payload, loading: null };
      return payload;
    } catch (e) {
      cache.loading = null;
      throw e;
    }
  })();

  return cache.loading;
}


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
