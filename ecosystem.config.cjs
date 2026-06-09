const path = require("path")

/** PM2 — ทางเลือกสำหรับรัน Next.js ตลอด (npm i -g pm2 แล้ว pm2 start ecosystem.config.cjs) */
module.exports = {
  apps: [
    {
      name: "x67-web",
      cwd: path.join(__dirname, ".."),
      script: "npm",
      args: "start",
      interpreter: "none",
      windowsHide: true,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
}
