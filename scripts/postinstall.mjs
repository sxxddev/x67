import { existsSync } from "node:fs"
import { execSync } from "node:child_process"

const schema = "prisma/schema.prisma"
if (!existsSync(schema)) {
  console.log("[postinstall] skip prisma generate — schema not in current directory")
  process.exit(0)
}

execSync("prisma generate", { stdio: "inherit" })
