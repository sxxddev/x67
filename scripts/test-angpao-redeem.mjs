/**
 * ทดสอบแลกซอง Vornyx — ตาม docs https://www.vornyx.pro/
 *
 * ใช้:
 *   npm run angpao:test -- "https://gift.truemoney.com/campaign/?v=..."
 *   npm run angpao:test -- "https://..." 0926418809
 */

import "dotenv/config"

const API_URL =
  process.env.ANGPAO_REDEEM_API_URL?.trim() ||
  "http://apitrue.vornyx.pro/truemoney"

const phone =
  process.argv[3]?.trim() ||
  process.env.ANGPAO_RECEIVER_PHONE?.trim() ||
  "0926418809"

const voucher = process.argv[2]?.trim()

if (!voucher) {
  console.error("Usage: npm run angpao:test -- <voucher-url> [phone]")
  console.error('Example: npm run angpao:test -- "https://gift.truemoney.com/campaign/?v=..."')
  process.exit(1)
}

const redeem = async (phoneNumber, voucherLink) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneNumber, voucher: voucherLink }),
  })
  const data = await res.json()
  if (data?.status?.code === "SUCCESS") {
    console.log("✅ รับเงินสำเร็จ", data.data.my_ticket.amount_baht, "บาท")
    console.log(JSON.stringify(data, null, 2))
    return true
  }
  console.log("❌ ล้มเหลว", JSON.stringify(data, null, 2))
  return false
}

console.log("API:", API_URL)
console.log("Phone:", phone)
console.log("Voucher:", voucher.slice(0, 60) + (voucher.length > 60 ? "..." : ""))
console.log("")

const ok = await redeem(phone, voucher)
process.exit(ok ? 0 : 1)
