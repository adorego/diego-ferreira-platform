import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin.123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'diego@diegoferreira.com' },
    update: {},
    create: {
      email: 'diego@diegoferreira.com',
      name: 'Diego Ferreira',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log(`✓ Usuario admin creado: ${admin.email} (role: ${admin.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
