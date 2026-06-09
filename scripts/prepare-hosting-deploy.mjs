/**
 * Build + pack x67secretme for inwCloud / DirectAdmin (Node.js) hosting.
 * Output: deploy/x67secretme-hosting.zip + deploy/database.sql
 */
import { spawnSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DEPLOY_DIR = join(ROOT, "deploy", "package")
const OUT_ZIP = join(ROOT, "deploy", "x67secretme-hosting.zip")
const require = createRequire(import.meta.url)

const COPY_PATHS = [
  "app",
  "components",
  "lib",
  "hooks",
  "prisma",
  "public",
  "styles",
  "data",
  "auth.ts",
  "next.config.mjs",
  "package.json",
  "package-lock.json",
  "postcss.config.mjs",
  "prisma.config.ts",
  "tsconfig.json",
  "next-env.d.ts",
  "components.json",
  "ecosystem.config.cjs",
  "server.js",
]

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next/cache",
  ".firebase",
  "food-delivery-miniapp",
  "fivem-ac-monitor",
])

function log(msg) {
  console.log(`[deploy] ${msg}`)
}

function fail(msg) {
  console.error(`[deploy] ERROR: ${msg}`)
  process.exit(1)
}

function loadEnv() {
  const envPath = join(ROOT, ".env")
  if (!existsSync(envPath)) fail(".env not found")
  const env = {}
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

function findMysqldump() {
  const candidates = [
    "mysqldump",
    "C:\\xampp\\mysql\\bin\\mysqldump.exe",
    "C:\\Program Files\\MariaDB 11.6\\bin\\mysqldump.exe",
    "C:\\Program Files\\MariaDB 11.4\\bin\\mysqldump.exe",
    "C:\\Program Files\\MariaDB 11.3\\bin\\mysqldump.exe",
    "C:\\Program Files\\MariaDB 10.11\\bin\\mysqldump.exe",
    "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe",
    "C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe",
  ]
  for (const bin of candidates) {
    if (bin === "mysqldump") {
      const r = spawnSync("where", ["mysqldump"], { shell: true, encoding: "utf8" })
      if (r.status === 0 && r.stdout.trim()) return "mysqldump"
      continue
    }
    if (existsSync(bin)) return bin
  }
  return null
}

async function exportDatabase(env) {
  const url = env.DATABASE_URL
  if (!url) {
    log("DATABASE_URL missing — skip DB export")
    return false
  }

  let parsed
  try {
    parsed = new URL(url.replace(/^mysql:\/\//, "http://"))
  } catch {
    log("Invalid DATABASE_URL — skip DB export")
    return false
  }

  const user = decodeURIComponent(parsed.username || "root")
  const pass = decodeURIComponent(parsed.password || "")
  const host = parsed.hostname || "localhost"
  const port = parsed.port || "3306"
  const db = parsed.pathname.replace(/^\//, "")

  const mysqldump = findMysqldump()
  const outSql = join(ROOT, "deploy", "database.sql")

  if (mysqldump) {
    log(`Exporting database "${db}" via mysqldump...`)
    const args = [
      `-h${host}`,
      `-P${port}`,
      `-u${user}`,
      ...(pass ? [`-p${pass}`] : []),
      "--single-transaction",
      "--routines",
      "--triggers",
      db,
    ]
    const r = spawnSync(mysqldump, args, {
      encoding: "buffer",
      maxBuffer: 512 * 1024 * 1024,
    })
    if (r.status === 0 && r.stdout?.length) {
      writeFileSync(outSql, r.stdout)
      log(`Saved ${outSql} (${Math.round(r.stdout.length / 1024)} KB)`)
      return true
    }
    log(`mysqldump failed: ${r.stderr?.toString("utf8").slice(0, 300) || "unknown"}`)
  } else {
    log("mysqldump not found")
  }

  if (await exportDatabaseWithNode(env)) return true

  const fallback = join(ROOT, "mq_sql_demo.sql")
  if (existsSync(fallback)) {
    cpSync(fallback, outSql)
    log(`Using fallback schema only: mq_sql_demo.sql (no live data)`)
    return true
  }

  log("No database.sql — export manually in phpMyAdmin before import on hosting")
  return false
}

function runBuild() {
  log("Running npm run build (may take a few minutes)...")
  const r = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  })
  if (r.status !== 0) fail("npm run build failed")
  if (!existsSync(join(ROOT, ".next"))) fail(".next folder missing after build")
  log("Build OK")
}

function copyTree(src, dest) {
  const st = statSync(src)
  if (st.isDirectory()) {
    mkdirSync(dest, { recursive: true })
    for (const name of readdirSync(src)) {
      if (SKIP_DIRS.has(name)) continue
      copyTree(join(src, name), join(dest, name))
    }
    return
  }
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest)
}

function createHostingEnv(env, hostingDbUrl) {
  const lines = [
    "# x67secretme — production on inwCloud / DirectAdmin",
    "# Edit DATABASE_URL if you skipped the prompt in PREPARE-HOSTING-DEPLOY.bat",
    "",
    `DATABASE_URL="${hostingDbUrl || "mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME"}"`,
    "",
    `AUTH_SECRET="${env.AUTH_SECRET || "CHANGE-ME-long-random-string"}"`,
    `AUTH_URL="${env.AUTH_URL || "https://x67secretme.shop"}"`,
    `NEXTAUTH_URL="${env.NEXTAUTH_URL || env.AUTH_URL || "https://x67secretme.shop"}"`,
    `NEXTAUTH_SECRET="${env.NEXTAUTH_SECRET || env.AUTH_SECRET || "CHANGE-ME-long-random-string"}"`,
    "",
    `NEXT_PUBLIC_DISCORD_TICKET_URL="${env.NEXT_PUBLIC_DISCORD_TICKET_URL || ""}"`,
    `NEXT_PUBLIC_DISCORD_SERVER_ID="${env.NEXT_PUBLIC_DISCORD_SERVER_ID || ""}"`,
    `DISCORD_BOT_TOKEN="${env.DISCORD_BOT_TOKEN || ""}"`,
    `DISCORD_BOT_CLIENT_ID="${env.DISCORD_BOT_CLIENT_ID || ""}"`,
    `NEXT_PUBLIC_UNICORN_PROJECT_ID="${env.NEXT_PUBLIC_UNICORN_PROJECT_ID || ""}"`,
    "",
    `LICENSE_API_SECRET="${env.LICENSE_API_SECRET || ""}"`,
    `ANGPAO_RECEIVER_PHONE="${env.ANGPAO_RECEIVER_PHONE || ""}"`,
    `ANGPAO_REDEEM_API_URL="${env.ANGPAO_REDEEM_API_URL || ""}"`,
    "",
    "NODE_ENV=production",
    "PORT=3000",
    "",
    "# Do NOT set CLOUDFLARE_TUNNEL_TOKEN on hosting — only for home PC tunnel",
  ]
  writeFileSync(join(DEPLOY_DIR, ".env.example"), lines.join("\n"), "utf8")
  log("Wrote .env.example (does not overwrite server .env on extract)")
}

function writeServerScripts() {
  const scriptsDir = join(DEPLOY_DIR, "scripts")
  mkdirSync(scriptsDir, { recursive: true })

  for (const name of ["fix-hosting-on-server.sh", "postinstall.mjs"]) {
    const src = join(ROOT, "scripts", name)
    if (existsSync(src)) {
      cpSync(src, join(scriptsDir, name))
      log(`Copy scripts/${name}`)
    }
  }

  const setupSh = readFileSync(join(ROOT, "scripts", "fix-hosting-on-server.sh"), "utf8")
  writeFileSync(join(DEPLOY_DIR, "setup.sh"), setupSh, "utf8")

  const installSh = `#!/bin/bash
set -e
cd "$(dirname "$0")"
chmod +x setup.sh scripts/fix-hosting-on-server.sh 2>/dev/null || true
exec ./setup.sh
`
  writeFileSync(join(DEPLOY_DIR, "install-on-server.sh"), installSh, "utf8")

  const readme = `# x67secretme — inwCloud (DirectAdmin)

## อัปโหลดแล้ว Extract ใน nextjs/ แล้วทำ 2 อย่าง:

### A) Terminal — รันคำสั่งเดียว
source /home/in8lx67secre/nodevenv/domains/x67secretme.shop/nextjs/20/bin/activate
cd /home/in8lx67secre/domains/x67secretme.shop/nextjs
chmod +x setup.sh
./setup.sh

### B) Setup Node.js App — ADD VARIABLE (copy จาก .env)
NODE_ENV, DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

Startup: server.js | Mode: Production | RESTART

### .env
ถ้ามี .env อยู่แล้วบน server — อย่าลบ (setup ไม่ทับ)
ถ้าใหม่ — แก้ DATABASE_URL เป็น user/pass ของ in8lx67secre_shop

Site: https://x67secretme.shop
`
  writeFileSync(join(DEPLOY_DIR, "HOSTING-README.txt"), readme, "utf8")

  writeFileSync(
    join(DEPLOY_DIR, "PANEL-ENV-VARS.txt"),
    `NODE_ENV=production
DATABASE_URL=(จาก .env บน server)
AUTH_SECRET=(จาก .env)
AUTH_URL=https://x67secretme.shop
NEXTAUTH_URL=https://x67secretme.shop
NEXTAUTH_SECRET=(จาก .env)
`,
    "utf8",
  )
}

async function exportDatabaseWithNode(env) {
  const url = env.DATABASE_URL
  if (!url) return false

  let parsed
  try {
    parsed = new URL(url.replace(/^mysql:\/\//, "http://"))
  } catch {
    return false
  }

  const outSql = join(ROOT, "deploy", "database.sql")
  try {
    const { createPool } = await import("mariadb")
    const pool = createPool({
      host: parsed.hostname || "localhost",
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username || "root"),
      password: decodeURIComponent(parsed.password || ""),
      database: parsed.pathname.replace(/^\//, ""),
      connectionLimit: 2,
    })
    const conn = await pool.getConnection()
    log("Exporting database via Node (mariadb)...")
    const dbName = parsed.pathname.replace(/^\//, "")
    const lines = [
      "-- x67secretme database export",
      "SET NAMES utf8mb4;",
      "SET FOREIGN_KEY_CHECKS=0;",
      "",
    ]
    const tables = await conn.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
      [dbName],
    )
    for (const row of tables) {
      const table = row.TABLE_NAME
      const createRows = await conn.query(`SHOW CREATE TABLE \`${table}\``)
      lines.push(`DROP TABLE IF EXISTS \`${table}\`;`)
      lines.push(`${createRows[0]["Create Table"]};`, "")
      const data = await conn.query(`SELECT * FROM \`${table}\``)
      for (const record of data) {
        const cols = Object.keys(record)
        const vals = cols.map((c) => {
          const v = record[c]
          if (v === null) return "NULL"
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace("T", " ")}'`
          if (typeof v === "number") return String(v)
          if (typeof v === "boolean") return v ? "1" : "0"
          if (Buffer.isBuffer(v)) return `X'${v.toString("hex")}'`
          return `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`
        })
        lines.push(
          `INSERT INTO \`${table}\` (\`${cols.join("`, `")}\`) VALUES (${vals.join(", ")});`,
        )
      }
      lines.push("")
    }
    lines.push("SET FOREIGN_KEY_CHECKS=1;", "")
    writeFileSync(outSql, lines.join("\n"), "utf8")
    await conn.release()
    await pool.end()
    log(`Saved ${outSql} (${Math.round(statSync(outSql).size / 1024)} KB)`)
    return true
  } catch (err) {
    log(`Node DB export failed: ${err.message}`)
    return false
  }
}

function createZip() {
  rmSync(OUT_ZIP, { force: true })
  const r = spawnSync("tar", ["-a", "-c", "-f", OUT_ZIP, "-C", DEPLOY_DIR, "."], {
    cwd: ROOT,
    stdio: "inherit",
  })
  if (r.status !== 0) {
    const ps1 = join(ROOT, "deploy", "_zip.ps1")
    writeFileSync(
      ps1,
      `$ErrorActionPreference='Stop'; Compress-Archive -Path '${DEPLOY_DIR.replace(/'/g, "''")}\\*' -DestinationPath '${OUT_ZIP.replace(/'/g, "''")}' -Force`,
      "utf8",
    )
    const r2 = spawnSync(
      "powershell",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1],
      { cwd: ROOT, stdio: "inherit" },
    )
    rmSync(ps1, { force: true })
    if (r2.status !== 0) fail("Failed to create zip")
  }
  log(`ZIP OK: ${OUT_ZIP}`)
}

async function main() {
  const hostingDbUrl = process.env.HOSTING_DATABASE_URL?.trim() || ""
  const env = loadEnv()

  log("=== x67secretme hosting pack ===")
  runBuild()
  await exportDatabase(env)

  rmSync(DEPLOY_DIR, { recursive: true, force: true })
  mkdirSync(DEPLOY_DIR, { recursive: true })

  for (const rel of COPY_PATHS) {
    const src = join(ROOT, rel)
    if (!existsSync(src)) {
      log(`Skip missing: ${rel}`)
      continue
    }
    const dest = join(DEPLOY_DIR, rel)
    log(`Copy ${rel}`)
    copyTree(src, dest)
  }

  log("Skip .next — server must run npm run build on Linux (setup.sh does this)")

  createHostingEnv(env, hostingDbUrl)
  writeServerScripts()

  if (existsSync(join(ROOT, "deploy", "database.sql"))) {
    cpSync(join(ROOT, "deploy", "database.sql"), join(DEPLOY_DIR, "database.sql"))
  }

  createZip()

  const zipSize = statSync(OUT_ZIP).size
  log("")
  log("=== DONE ===")
  log(`Zip: ${relative(ROOT, OUT_ZIP)} (${Math.round(zipSize / 1024 / 1024)} MB)`)
  log(`Also: deploy/database.sql + deploy/package/ (folder before zip)`)
  log("")
  log("Next: upload deploy/x67secretme-hosting.zip to inwCloud -> extract to .../nextjs/")
  log("Read deploy/package/HOSTING-README.txt for DirectAdmin steps")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
