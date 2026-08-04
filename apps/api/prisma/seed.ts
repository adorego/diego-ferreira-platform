import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Prisma 7 + driver adapters: el PrismaClient de un script standalone (fuera de
// Nest) necesita el adapter explícito, igual que PrismaService en src/prisma/.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const ADMIN_EMAIL = 'diego@diegoferreira.coach'
// Dominio previo, de antes de migrar a .coach — se limpia si quedó de un seed viejo.
const LEGACY_ADMIN_EMAIL = 'diego@diegoferreira.com'

// Todos los datos de este seed usan @test.com — así el guard de idempotencia
// borra únicamente lo que este script crea, nunca datos reales de otro origen.
const DEV_DOMAIN = '@test.com'

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function atTime(days: number, hour: number, minute = 0): Date {
  const d = daysFromNow(days)
  d.setHours(hour, minute, 0, 0)
  return d
}

async function main() {
  // ── Idempotencia ───────────────────────────────────────────────────────────
  const existing = await prisma.user.findMany({
    where: { email: { endsWith: DEV_DOMAIN } },
    select: { id: true },
  })
  const existingIds = existing.map(u => u.id)

  await prisma.session.deleteMany({ where: { patientId: { in: existingIds } } })
  await prisma.payment.deleteMany({ where: { patientId: { in: existingIds } } })
  await prisma.user.deleteMany({ where: { email: { endsWith: DEV_DOMAIN } } })
  await prisma.user.deleteMany({ where: { email: LEGACY_ADMIN_EMAIL } })
  await prisma.bookPurchase.deleteMany({ where: { email: { endsWith: DEV_DOMAIN } } })

  // ── Admin ──────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: 'Diego Ferreira',
      passwordHash: bcrypt.hashSync('Admin.123', 10),
      role: 'ADMIN',
      status: 'APPROVED',
    },
  })

  // ── Paciente 1 — PROSPECT: recién agendó, sin sesión aprobada ────────────────
  await prisma.user.create({
    data: {
      email: 'prospecto@test.com',
      name: 'Carlos Rodríguez',
      passwordHash: bcrypt.hashSync('Patient.123', 10),
      role: 'PATIENT',
      status: 'PROSPECT',
    },
  })

  // ── Paciente 2 — APPROVED: aprobado, sesión con pago pendiente ───────────────
  // Nota: SessionType solo tiene EXPLORATORY|PLAN en el schema (no hay tiers tipo
  // "ESTANDAR"/"PREMIUM"); el tier de precio se guarda en Session.price.
  await prisma.user.create({
    data: {
      email: 'aprobado@test.com',
      name: 'Martina García',
      passwordHash: bcrypt.hashSync('Patient.123', 10),
      role: 'PATIENT',
      status: 'APPROVED',
      sessions: {
        create: [{
          type:  'PLAN',
          status: 'PENDING', // AppStatus no tiene "PENDING_PAYMENT" — PENDING es el equivalente
          start: daysFromNow(3),
          price: 1800000, // tier "Estándar"
        }],
      },
    },
  })

  // ── Paciente 3 — cliente activo: sesión confirmada + pago confirmado ─────────
  // Nota: se usa status ACTIVE (no APPROVED) para que sea distinguible de
  // aprobado@test.com — ACTIVE es el valor de UserStatus que representa un
  // cliente que ya pagó, coherente con el resumen impreso abajo ("🟢 ACTIVE").
  const activo = await prisma.user.create({
    data: {
      email: 'activo@test.com',
      name: 'Lucas Benítez',
      passwordHash: bcrypt.hashSync('Patient.123', 10),
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  })

  const pagoActivo = await prisma.payment.create({
    data: {
      patientId:        activo.id,
      amount:            2000000, // tier "Premium"
      currency:         'PYG',
      status:           'CONFIRMED',
      bancardProcessId: '99900001', // prefijo 999 = dato de seed
      authNumber:       'DEV001',
    },
  })

  await prisma.session.create({
    data: {
      patientId:   activo.id,
      type:        'PLAN',
      status:      'CONFIRMED',
      start:       atTime(1, 10, 0), // mañana a las 10:00
      gcalEventId: 'fake_event_id_dev',
      roomUrl:     'https://meet.google.com/fake-dev-link',
      price:       2000000,
      paymentId:   pagoActivo.id,
    },
  })

  // ── Compras del libro ────────────────────────────────────────────────────────
  await prisma.bookPurchase.create({
    data: {
      email:         'lector1@test.com',
      nombre:        'Ana Martínez',
      shopProcessId: '99900101', // prefijo 999 = dato de seed
      status:        'CONFIRMED',
      downloadToken: 'dev-token-001-fake',
      downloadedAt:  daysFromNow(-2),
    },
  })

  await prisma.bookPurchase.create({
    data: {
      email:         'lector2@test.com',
      nombre:        'Pedro Sosa',
      shopProcessId: '99900102',
      status:        'PENDING',
    },
  })

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════╗
║         SEED DE DESARROLLO COMPLETADO         ║
╠══════════════════════════════════════════════╣
║  👤 Admin: diego@diegoferreira.coach          ║
║     Password: Admin.123                       ║
╠══════════════════════════════════════════════╣
║  PACIENTES:                                   ║
║  🔵 PROSPECT  → prospecto@test.com            ║
║  🟡 APPROVED  → aprobado@test.com             ║
║  🟢 ACTIVE    → activo@test.com               ║
╠══════════════════════════════════════════════╣
║  LIBRO:                                       ║
║  ✅ CONFIRMED → lector1@test.com              ║
║     Token: dev-token-001-fake                 ║
║  ⏳ PENDING   → lector2@test.com              ║
╠══════════════════════════════════════════════╣
║  URLS PARA PROBAR:                            ║
║  Landing:  http://localhost:3000/main         ║
║  Agendar:  http://localhost:3000/agendar      ║
║  Libro:    http://localhost:3000/avanza       ║
║  Admin:    http://localhost:3001              ║
║  API:      http://localhost:8080/health       ║
║  Prisma:   http://localhost:5555              ║
╚══════════════════════════════════════════════╝
`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
