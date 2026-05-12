import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "demo@example.com"
  const password = "Password123!"
  const hashedPassword = bcrypt.hashSync(password, 10)

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {},
    create: {
      name: "Demo User",
      email,
      phone: "0240000000",
      password: hashedPassword,
      loyaltyPoints: 150
    }
  })

  console.log("✅ Demo Customer Account Ready:")
  console.log(`📧 Email: ${customer.email}`)
  console.log(`🔑 Password: ${password}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
