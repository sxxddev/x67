/**
 * ตัดพื้นดำรอบโลโก้ (เชื่อมจากขอบภาพ) → PNG โปร่งใส
 * รัน: npm run logo:transparent
 */
import sharp from "sharp"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const input = path.join(root, "public", "logo.png")
const outputTransparent = path.join(root, "public", "logo-transparent.png")
const outputMain = path.join(root, "public", "logo.png")
const sourceBackup = path.join(root, "public", "logo-source.png")

/** พื้นหลังดำที่เชื่อมจากขอบ — ค่าความสว่างต่ำกว่านี้ถือเป็นพื้น */
const BG_LUM_MAX = 32
/** ความต่างสีต่ำ (เกือบเทา/ดำ) ช่วยไม่กินเงาโลโก้ที่มีสี */
const BG_CHROMA_MAX = 28

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function chroma(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b)
}

function isBackgroundPixel(r, g, b) {
  return luminance(r, g, b) <= BG_LUM_MAX && chroma(r, g, b) <= BG_CHROMA_MAX
}

function floodFillBackground(data, width, height) {
  const size = width * height
  const visited = new Uint8Array(size)
  const queue = []

  const pushIfBg = (x, y) => {
    const i = y * width + x
    if (visited[i]) return
    const o = i * 4
    if (!isBackgroundPixel(data[o], data[o + 1], data[o + 2])) return
    visited[i] = 1
    queue.push(i)
  }

  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0)
    pushIfBg(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y)
    pushIfBg(width - 1, y)
  }

  while (queue.length > 0) {
    const i = queue.pop()
    const x = i % width
    const y = (i - x) / width
    if (x > 0) pushIfBg(x - 1, y)
    if (x < width - 1) pushIfBg(x + 1, y)
    if (y > 0) pushIfBg(x, y - 1)
    if (y < height - 1) pushIfBg(x, y + 1)
  }

  for (let i = 0; i < size; i++) {
    if (visited[i]) {
      data[i * 4 + 3] = 0
    }
  }
}

const readFrom = fs.existsSync(sourceBackup) ? sourceBackup : input
if (!fs.existsSync(readFrom)) {
  console.error(`[error] Missing ${readFrom}`)
  process.exit(1)
}

if (!fs.existsSync(sourceBackup) && fs.existsSync(input)) {
  await fs.promises.copyFile(input, sourceBackup)
  console.log(`[ok] Backup source: ${sourceBackup}`)
}

const { data, info } = await sharp(readFrom)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

floodFillBackground(data, info.width, info.height)

const png = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer()

await fs.promises.writeFile(outputTransparent, png)
await fs.promises.copyFile(outputTransparent, outputMain)

console.log(`[ok] Transparent logo: ${outputTransparent} (${info.width}x${info.height})`)
console.log(`[ok] Updated: ${outputMain}`)
