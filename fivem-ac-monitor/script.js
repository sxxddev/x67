const PAGE_SIZE = 12;
const API = '/api/thailand';
const REFRESH_API = '/api/refresh';
const fetchOpts = { credentials: 'same-origin' };
const LOCAL_CACHE_KEY = 'fivem_th_dashboard_v1';
const FETCH_THAILAND_MS = 28000;

let allServers = [];
let filtered = [];
let currentPage = 1;
let viewMode = 'list';

let currentUser = null;

function formatInt(n) {
  return new Intl.NumberFormat('th-TH').format(n);
}

function switchPage(page) {
    if (page === 'status') {
        if (!currentUser) {
            showAuthGate('login');
            return;
        }
        document.getElementById('page-home').hidden = true;
        document.getElementById('page-status').hidden = false;
        if(document.getElementById('nav-item-home')) document.getElementById('nav-item-home').classList.remove('active');
        if(document.getElementById('nav-item-status')) document.getElementById('nav-item-status').classList.add('active');
        window.scrollTo({top: 0, behavior: 'smooth'});
    } else {
        document.getElementById('page-home').hidden = false;
        document.getElementById('page-status').hidden = true;
        if(document.getElementById('nav-item-home')) document.getElementById('nav-item-home').classList.add('active');
        if(document.getElementById('nav-item-status')) document.getElementById('nav-item-status').classList.remove('active');
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

function updateTime() {
  const el = document.getElementById('time-update');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function badgeClass(type) {
  const map = {
    ghostx: 'badg-ghostx',
    bt: 'badg-bt',
    nc: 'badg-nc',
    crc: 'badg-crc',
    fini: 'badg-fini',
    wave: 'badg-wave',
    launcher: 'badg-launcher',
    no_ac: 'badg-no-ac',
    'no-ac': 'badg-no-ac',
    cockoy: 'badg-cockoy',
    fiveguard: 'badg-ac-tool',
    pegasus: 'badg-ac-tool',
    electron: 'badg-ac-tool',
    titan: 'badg-ac-tool',
    secure: 'badg-ac-tool',
  };
  return map[type] || 'badg-ac-tool';
}

function renderPrograms(programs) {
  const root = document.getElementById('program-cards');
  if (!root || !programs || !programs.length) return;
  root.innerHTML = programs
    .map((p) => {
      const st = (p.status || 'undetected').toLowerCase();
      const badge =
        st === 'warning'
          ? '<div class="badge-status badge-yellow"><span class="dot yellow-dot"></span> Warning</div>'
          : st === 'stop' || st === 'stopped'
            ? '<div class="badge-status badge-red-stop"><span class="dot red-dot"></span> Stop</div>'
            : '<div class="badge-status badge-green"><span class="dot green-dot"></span> Undetected</div>';
      const img = p.image
        ? `<img src="${escapeAttr(p.image)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><i class="fa-solid fa-shield-halved fallback-icon" style="display:none;color:#d8b4fe;font-size:24px;"></i>`
        : '<i class="fa-solid fa-shield-halved" style="color:#d8b4fe;font-size:24px;"></i>';
      const iconBg = p.id === 'skynet' ? 'bg-blue-dark' : 'bg-purple-dark';
      return `
      <div class="small-product-box">
        <div class="product-icon-bg ${iconBg}">${img}</div>
        <div class="product-info">
          <h3><i class="fa-solid fa-bolt text-yellow lightning-pulse"></i> ${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description || '')}</p>
        </div>
        ${badge}
      </div>`;
    })
    .join('');
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}

function applyStats(stats) {
  document.getElementById('stat-servers').textContent = formatInt(stats.totalServers);
  document.getElementById('stat-players').textContent = formatInt(stats.totalPlayers);
  document.getElementById('stat-active').textContent = formatInt(stats.activeServers);
  document.getElementById('stat-gta5').textContent = formatInt(stats.gta5Instances);

  if (document.getElementById('hero-stat-servers')) document.getElementById('hero-stat-servers').textContent = formatInt(stats.totalServers);
  if (document.getElementById('hero-stat-players')) document.getElementById('hero-stat-players').textContent = formatInt(stats.totalPlayers);
  if (document.getElementById('hero-stat-active')) document.getElementById('hero-stat-active').textContent = formatInt(stats.activeServers);
}

function applySystemStatus(sys) {
  document.getElementById('count-undetected').textContent = formatInt(sys.undetected);
  document.getElementById('count-warning').textContent = formatInt(sys.warning);
  document.getElementById('count-stop').textContent = formatInt(sys.stop);
  renderPrograms(sys.programs || []);
}

function setLoading(on) {
  const b = document.getElementById('load-banner');
  const e = document.getElementById('error-banner');
  if (b) b.hidden = !on;
  if (on && e) {
    e.hidden = true;
    e.textContent = '';
  }
}

function showError(msg) {
  const e = document.getElementById('error-banner');
  if (!e) return;
  if (!msg) {
    e.hidden = true;
    e.textContent = '';
    return;
  }
  e.hidden = false;
  e.textContent = msg;
}

function showCacheWarning(msg) {
  const c = document.getElementById('cache-banner');
  if (!c) return;
  c.hidden = !msg;
  c.textContent = msg || '';
}

function setAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  if (msg) {
    el.hidden = false;
    el.textContent = msg;
  } else {
    el.hidden = true;
    el.textContent = '';
  }
}

function showAppShell(username) {
  currentUser = username;
  document.getElementById('auth-gate')?.classList.add('auth-overlay--hidden');
  
  const loginBtn = document.getElementById('btn-login-main');
  const regBtn = document.getElementById('btn-register-main');
  const logoutBtn = document.getElementById('btn-logout');
  const navUser = document.getElementById('nav-user');
  const adminBtn = document.getElementById('btn-admin');

  if (loginBtn) loginBtn.hidden = true;
  if (regBtn) regBtn.hidden = true;
  if (logoutBtn) logoutBtn.hidden = false;
  if (navUser) {
    navUser.textContent = username ? `สวัสดี, ${username}` : '';
    navUser.hidden = false;
  }
  
  if (adminBtn) {
    if (username && username.toLowerCase() === 'admin') {
      adminBtn.hidden = false;
    } else {
      adminBtn.hidden = true;
    }
  }
}

function showAuthGate(mode) {
  document.getElementById('auth-gate')?.classList.remove('auth-overlay--hidden');
  if (mode === 'login' || mode === 'register') {
    showAuthView(mode);
  }
  if (window.location.hash !== '#auth') {
    history.pushState({ auth: true }, '', '#auth');
  }
}

function hideAuthGate(fromPopState = false) {
  document.getElementById('auth-gate')?.classList.add('auth-overlay--hidden');
  if (!fromPopState && window.location.hash === '#auth') {
    history.back();
  }
  if (!currentUser) {
    switchPage('home');
  }
}

window.addEventListener('popstate', () => {
  const gate = document.getElementById('auth-gate');
  if (gate && !gate.classList.contains('auth-overlay--hidden')) {
    hideAuthGate(true);
  }
});

function showGuestView() {
  currentUser = null;
  document.getElementById('auth-gate')?.classList.add('auth-overlay--hidden');
  
  const loginBtn = document.getElementById('btn-login-main');
  const regBtn = document.getElementById('btn-register-main');
  const logoutBtn = document.getElementById('btn-logout');
  const navUser = document.getElementById('nav-user');
  const adminBtn = document.getElementById('btn-admin');

  if (loginBtn) loginBtn.hidden = false;
  if (regBtn) regBtn.hidden = false;
  if (logoutBtn) logoutBtn.hidden = true;
  if (navUser) {
    navUser.textContent = '';
    navUser.hidden = true;
  }
  if (adminBtn) adminBtn.hidden = true;

  // Ensure status page is hidden if guest
  document.getElementById('page-home').hidden = false;
  document.getElementById('page-status').hidden = true;
}

function renderServerList() {
  const list = document.getElementById('server-list');
  if (!list) return;
  list.className = viewMode === 'grid' ? 'server-list grid-view' : 'server-list';
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  list.innerHTML = pageRows
    .map((server, idx) => {
      const rank = start + idx + 1;
      const playersF = formatInt(server.players);
      const maxF = formatInt(server.maxPlayers);
      const b = server.badge || { type: 'no-ac', text: 'ไม่พบ Anti-Cheat' };
      const bc = badgeClass(b.type);
      const logo = server.icon
        ? `<img src="${escapeAttr(server.icon)}" alt="" class="server-logo" loading="eager" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
           <span class="server-logo-text" style="display:none">${escapeHtml(server.endpoint.slice(0, 2).toUpperCase())}</span>`
        : `<span class="server-logo-text">${escapeHtml(server.endpoint.slice(0, 2).toUpperCase())}</span>`;
      const grad = hashGradient(server.endpoint);
      return `
      <div class="server-item" data-endpoint="${escapeAttr(server.endpoint)}">
        <div class="server-rank">${rank}</div>
        <div class="server-logo-wrapper" style="background:${grad}">
          ${logo}
        </div>
        <div class="server-details">
          <div class="server-name">${escapeHtml(server.name)}</div>
          <div class="server-desc">${server.sub ? '➔ ' + escapeHtml(server.sub) : ''}</div>
          <div class="server-badges">
            <span class="badg ${bc}">${escapeHtml(b.text)}</span>
          </div>
        </div>
        <div class="server-right">
          <div class="player-count">${playersF} <span class="player-max">/${maxF}</span></div>
          <div class="server-actions">
            <button class="action-btn" type="button" data-copy="${escapeAttr(server.connect)}" title="คัดลอกลิงก์เข้าเซิร์ฟเวอร์"><i class="fa-regular fa-copy"></i></button>
            <button class="action-btn play" type="button" data-open="${escapeAttr(server.connect)}" title="เปิด FiveM / เข้าเซิร์ฟเวอร์"><i class="fa-solid fa-play"></i></button>
          </div>
        </div>
      </div>`;
    })
    .join('');

  list.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-copy');
      if (navigator.clipboard && u) {
        navigator.clipboard.writeText(u).catch(() => window.prompt('คัดลอกลิงก์', u));
      }
    });
  });
  list.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-open');
      if (u) window.open(u, '_blank', 'noopener,noreferrer');
    });
  });
}

function hashGradient(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hues = [280, 200, 330, 160, 25, 340];
  const h1 = hues[h % hues.length];
  const h2 = hues[(h >> 3) % hues.length];
  return `linear-gradient(135deg, hsl(${h1} 65% 38%), hsl(${h2} 60% 28%))`;
}

function renderPagination() {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const parts = [];
  parts.push(
    `<button class="page-btn ${currentPage <= 1 ? 'disabled' : ''}" type="button" data-page="prev"><i class="fa-solid fa-chevron-left"></i> ก่อนหน้า</button>`,
  );

  const maxButtons = 7;
  let start = Math.max(1, currentPage - 3);
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  if (start > 1) {
    parts.push(`<button class="page-btn" type="button" data-page="1">1</button>`);
    if (start > 2) parts.push(`<span class="page-dots">…</span>`);
  }
  for (let p = start; p <= end; p++) {
    parts.push(
      `<button class="page-btn ${p === currentPage ? 'active' : ''}" type="button" data-page="${p}">${p}</button>`,
    );
  }
  if (end < totalPages) {
    if (end < totalPages - 1) parts.push(`<span class="page-dots">…</span>`);
    parts.push(
      `<button class="page-btn" type="button" data-page="${totalPages}">${totalPages}</button>`,
    );
  }

  parts.push(
    `<button class="page-btn ${currentPage >= totalPages ? 'disabled' : ''}" type="button" data-page="next">ถัดไป <i class="fa-solid fa-chevron-right"></i></button>`,
  );

  pag.innerHTML = parts.join('');

  pag.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-page');
      const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (raw === 'prev') currentPage = Math.max(1, currentPage - 1);
      else if (raw === 'next') currentPage = Math.min(total, currentPage + 1);
      else currentPage = Number(raw) || 1;
      renderServerList();
      renderPagination();
    });
  });
}

function applyFilter() {
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  if (!q) {
    filtered = allServers.slice();
  } else {
    filtered = allServers.filter((s) => {
      const blob = `${s.name} ${s.sub || ''} ${s.endpoint} ${(s.badge && s.badge.text) || ''}`.toLowerCase();
      return blob.includes(q);
    });
  }
  currentPage = 1;
  renderServerList();
  renderPagination();
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocalCache(data) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function normalizeServerIconUrl(icon) {
  if (!icon || typeof icon !== 'string') return icon;
  const m = icon.match(/\/api\/server-icon\/([^/]+)\/(.+)\.png$/);
  if (m) {
    return `https://servers-frontend.fivem.net/api/servers/icon/${m[1]}/${m[2]}.png`;
  }
  return icon;
}

function applyPayload(data) {
  if (data.stale && data.cacheWarning) {
    showCacheWarning(data.cacheWarning);
  } else {
    showCacheWarning('');
  }
  if (data.error) {
    showError(data.error);
  } else {
    showError('');
  }
  allServers = (data.servers || []).map((s) => {
    const icon = normalizeServerIconUrl(s.icon);
    return icon === s.icon ? s : { ...s, icon };
  });
  filtered = allServers.slice();
  applyStats(data.stats || { totalServers: 0, totalPlayers: 0, activeServers: 0, gta5Instances: 0 });
  applySystemStatus(data.systemStatus || { undetected: 0, warning: 0, stop: 0, programs: [] });
  currentPage = 1;
  renderServerList();
  renderPagination();
}

async function loadData(forceRefresh) {
  showError('');
  showCacheWarning('');

  const cached = !forceRefresh ? readLocalCache() : null;
  const hasLocal = cached && Array.isArray(cached.servers) && cached.servers.length > 0;
  if (hasLocal) {
    applyPayload(cached);
    setLoading(false);
  }

  const needSpinner = forceRefresh || !hasLocal;
  let spinnerTimer = null;
  if (needSpinner) {
    if (forceRefresh) setLoading(true);
    else spinnerTimer = setTimeout(() => setLoading(true), 80);
  }

  const abortCtl = new AbortController();
  const abortTimer = setTimeout(() => abortCtl.abort(), FETCH_THAILAND_MS);

  try {
    const url = forceRefresh ? `${REFRESH_API}?t=${Date.now()}` : API;
    const res = await fetch(url, { ...fetchOpts, signal: abortCtl.signal });
    if (res.status === 401) {
      showAuthGate();
      throw new Error('session');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (spinnerTimer) clearTimeout(spinnerTimer);
    setLoading(false);
    writeLocalCache(data);
    applyPayload(data);
  } catch (e) {
    console.error(e);
    if (String(e.message) === 'session') return;
    const aborted = e && (e.name === 'AbortError' || e.code === 20);
    if (aborted) {
      if (!hasLocal) {
        showError('โหลดนานเกินไป — ลองกดรีเฟรชหรือตรวจสอบเครือข่าย');
      } else {
        showCacheWarning('อัปเดตล่าสุดไม่สำเร็จ — แสดงข้อมูลจากแคชเครื่อง');
      }
    } else if (!hasLocal) {
      showError(
        e.message ||
          'โหลดข้อมูลไม่สำเร็จ — ตรวจสอบเครือข่ายหรือว่า FiveM API ถูกบล็อก (403)',
      );
    }
  } finally {
    clearTimeout(abortTimer);
    if (spinnerTimer) clearTimeout(spinnerTimer);
    setLoading(false);
  }
}

async function refreshData() {
  const btn = document.querySelector('.btn-refresh i');
  if (btn) btn.classList.add('spin-anim');
  await loadData(true);
  updateTime();
  setTimeout(() => {
    if (btn) btn.classList.remove('spin-anim');
  }, 600);
}

async function initSession() {
  try {
    const res = await fetch('/api/me', fetchOpts);
    if (!res.ok) {
      showGuestView();
      return null;
    }
    const data = await res.json();
    showAppShell(data.username);
    return data.username;
  } catch {
    showGuestView();
    return null;
  }
}

function showAuthView(mode) {
  const login = document.getElementById('auth-panel-login');
  const reg = document.getElementById('auth-panel-register');
  if (mode === 'register') {
    reg?.removeAttribute('hidden');
    login?.setAttribute('hidden', '');
  } else {
    login?.removeAttribute('hidden');
    reg?.setAttribute('hidden', '');
  }
  setAuthError('');
}

function bindAuthForms() {
  document.getElementById('link-to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthView('register');
  });
  document.getElementById('link-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthView('login');
  });

  document.querySelectorAll('.auth-toggle-pw').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-target');
      const input = id && document.getElementById(id);
      if (!input) return;
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon?.classList.remove('fa-eye');
        icon?.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon?.classList.remove('fa-eye-slash');
        icon?.classList.add('fa-eye');
      }
    });
  });

  document.getElementById('form-login')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    setAuthError('');
    const fd = new FormData(ev.target);
    const rememberEl = ev.target.querySelector('input[name="remember"]');
    const body = {
      username: String(fd.get('username') || '').trim(),
      password: String(fd.get('password') || ''),
      remember: Boolean(rememberEl && rememberEl.checked),
    };
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...fetchOpts,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      
      if (body.remember) {
        localStorage.setItem('__devlucas_creds', JSON.stringify({ u: body.username, p: body.password }));
      } else {
        localStorage.removeItem('__devlucas_creds');
      }
      
      showAppShell(data.username);
      await loadData(false);
    } catch (err) {
      setAuthError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  });

  document.getElementById('form-register')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    setAuthError('');
    const fd = new FormData(ev.target);
    const p1 = String(fd.get('password') || '');
    const p2 = String(fd.get('password2') || '');
    if (p1 !== p2) {
      setAuthError('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }
    const body = {
      username: String(fd.get('username') || '').trim(),
      password: p1,
    };
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...fetchOpts,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'สมัครไม่สำเร็จ');
      showAppShell(data.username);
      await loadData(false);
    } catch (err) {
      setAuthError(err.message || 'สมัครไม่สำเร็จ');
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', ...fetchOpts });
    try {
      localStorage.removeItem(LOCAL_CACHE_KEY);
    } catch {
      /* ignore */
    }
    allServers = [];
    filtered = [];
    showGuestView();
    document.getElementById('server-list') && (document.getElementById('server-list').innerHTML = '');
    document.getElementById('pagination') && (document.getElementById('pagination').innerHTML = '');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  updateTime();
  setInterval(updateTime, 1000);

  // Restore remembered credentials
  try {
    const saved = localStorage.getItem('__devlucas_creds');
    if (saved) {
      const { u, p } = JSON.parse(saved);
      const form = document.getElementById('form-login');
      if (form) {
        const uIn = form.querySelector('[name="username"]');
        const pIn = form.querySelector('[name="password"]');
        const rIn = form.querySelector('[name="remember"]');
        if (uIn && pIn && rIn) {
          uIn.value = u;
          pIn.value = p;
          rIn.checked = true;
        }
      }
    }
  } catch {}

  bindAuthForms();
  
  document.getElementById('auth-gate')?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-gate') hideAuthGate();
  });
  document.getElementById('admin-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'admin-modal') e.target.classList.add('auth-overlay--hidden');
  });

  await initSession();
  await loadData(false);

  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('input', () => applyFilter());
  }

  document.getElementById('btn-sort')?.addEventListener('click', () => {
    allServers.sort((a, b) => b.players - a.players);
    applyFilter();
    document.getElementById('btn-sort')?.classList.add('active');
  });

  document.getElementById('btn-layout')?.addEventListener('click', () => {
    viewMode = viewMode === 'list' ? 'grid' : 'list';
    const btn = document.getElementById('btn-layout');
    if (btn) {
      const icon = viewMode === 'grid' ? 'fa-solid fa-grip' : 'fa-solid fa-list';
      btn.innerHTML = `<i class="${icon}"></i> มุมมอง`;
      btn.classList.toggle('active', viewMode === 'grid');
    }
    renderServerList();
  });

  document.getElementById('btn-admin')?.addEventListener('click', async () => {
    document.getElementById('admin-modal')?.classList.remove('auth-overlay--hidden');
    try {
      const res = await fetch('/api/admin/stats', fetchOpts);
      if (!res.ok) throw new Error('Forbidden');
      const data = await res.json();
      document.getElementById('admin-total-users').textContent = data.users.length;
      document.getElementById('admin-users-list').innerHTML = data.users.map(u => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding:6px 0;"><span><i class="fa-solid fa-user" style="color:var(--text-muted);margin-right:8px;"></i> <span style="color:#e2e8f0; font-weight:600;">${escapeHtml(u.username)}</span></span><span style="color:#9ca3af; font-size:0.85rem;">รหัส: <strong style="color:#60a5fa; letter-spacing:0.5px;">${escapeHtml(u.password)}</strong></span></div>`).join('');
      document.getElementById('admin-logs-list').innerHTML = data.logs.map(l => {
        const d = new Date(l.time).toLocaleString('th-TH');
        let color = '#60a5fa';
        if (l.action === 'REGISTER') color = '#34d399';
        else if (l.action === 'LOGIN_FAILED') color = '#f87171';
        return `<div style="padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:var(--text-muted)">[${d}]</span> <strong style="color:${color}">${l.action}</strong>: <span style="color:#e2e8f0; font-weight:600;">${escapeHtml(l.username)}</span> <br><span style="padding-left:15px; color:#9ca3af; font-size:0.8rem;">${escapeHtml(l.details)}</span></div>`;
      }).join('');
    } catch {
      document.getElementById('admin-users-list').innerHTML = '<div style="color:red">ไม่มีสิทธิ์หรือเกิดข้อผิดพลาด</div>';
    }
  });
});

window.refreshData = refreshData;
