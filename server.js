/**
 * DirectAdmin / CloudLinux Node.js startup (Passenger-compatible).
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") })

const http = require("http")
const { parse } = require("url")
const next = require("next")

const port = parseInt(process.env.PORT || process.env.NODE_PORT || "3000", 10)

const app = next({
  dev: false,
  dir: __dirname,
})

const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        handle(parse(req.url, true), req, res)
      })
      .listen(port, () => {
        console.log(`Next.js ready on port ${port}`)
      })
  })
  .catch((err) => {
    console.error("Next.js failed to start:", err)
    process.exit(1)
  })
