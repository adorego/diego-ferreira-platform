import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

// Prisma 7 + driver adapters: un script standalone (fuera de Nest) necesita el
// adapter explícito, igual que PrismaService en src/prisma/ y prisma/seed.ts.
// DATABASE_URL la inyecta `railway run` — no se hardcodea ninguna connection string.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const ADMIN_EMAIL = 'diego@diegoferreira.coach'
const NEW_PASSWORD = 'Ferreira2026!'

async function main() {
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10)

  const updated = await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { passwordHash },
    select: { email: true, role: true },
  })

  console.log('Password reseteada correctamente.')
  console.log(`Email: ${updated.email}`)
  console.log(`Role:  ${updated.role}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
