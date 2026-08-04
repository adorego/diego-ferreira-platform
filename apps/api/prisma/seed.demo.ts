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
const LEGACY_ADMIN_EMAIL = 'diego@diegoferreira.com'

// Todos los pacientes/compras de este seed usan @demo.com — así el guard de
// idempotencia borra únicamente lo que este script crea.
const DEMO_DOMAIN = '@demo.com'

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

function atTime(days: number, hour: number, minute = 0): Date {
  const d = daysFromNow(days)
  d.setHours(hour, minute, 0, 0)
  return d
}

function formatMiles(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function describeUpcoming(date: Date): string {
  const diffMs    = date.getTime() - Date.now()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays  = Math.floor(diffHours / 24)
  if (diffHours <= 0) return 'ya pasó'
  if (diffDays === 0) return `HOY en ~${Math.max(1, Math.round(diffHours))} horas`
  if (diffDays === 1) return 'MAÑANA'
  return `en ${diffDays} días`
}

async function main() {
  // ── Idempotencia ───────────────────────────────────────────────────────────
  const existing = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_DOMAIN } },
    select: { id: true },
  })
  const existingIds = existing.map(u => u.id)

  await prisma.session.deleteMany({ where: { patientId: { in: existingIds } } })
  await prisma.payment.deleteMany({ where: { patientId: { in: existingIds } } })
  await prisma.user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } })
  await prisma.user.deleteMany({ where: { email: LEGACY_ADMIN_EMAIL } })
  await prisma.bookPurchase.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } })

  // ── Admin (mismo que el seed de desarrollo) ──────────────────────────────────
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

  // ── Pacientes ────────────────────────────────────────────────────────────
  // SessionType solo tiene EXPLORATORY|PLAN en el schema — todas las sesiones
  // pagas de abajo usan PLAN, y el tier (Básico/Estándar/Premium) se refleja
  // solo en el monto (Session.price / Payment.amount), no en un enum propio.
  type PlanTier = { price: number; label: string }
  const BASICO:   PlanTier = { price: 1_300_000, label: 'Básico' }
  const ESTANDAR: PlanTier = { price: 1_800_000, label: 'Estándar' }
  const PREMIUM:  PlanTier = { price: 2_000_000, label: 'Premium' }

  async function createPacienteConSesion(opts: {
    email: string
    name: string
    tier: PlanTier
    start: Date
    sessionStatus: 'CONFIRMED' | 'COMPLETED'
    bancardSuffix: string
    roomUrl?: string
  }) {
    const patient = await prisma.user.create({
      data: {
        email: opts.email,
        name: opts.name,
        passwordHash: bcrypt.hashSync('Patient.123', 10),
        role: 'PATIENT',
        status: 'APPROVED',
      },
    })

    const payment = await prisma.payment.create({
      data: {
        patientId:        patient.id,
        amount:            opts.tier.price,
        currency:         'PYG',
        status:           'CONFIRMED',
        bancardProcessId: `999${opts.bancardSuffix}`, // prefijo 999 = dato de seed
        authNumber:       `DEMO${opts.bancardSuffix}`,
      },
    })

    await prisma.session.create({
      data: {
        patientId: patient.id,
        type:      'PLAN',
        status:    opts.sessionStatus,
        start:     opts.start,
        roomUrl:   opts.roomUrl,
        price:     opts.tier.price,
        paymentId: payment.id,
      },
    })

    return patient
  }

  // Deportistas jóvenes (target principal)
  await createPacienteConSesion({
    email: 'sebastian.olmedo@demo.com',
    name: 'Sebastián Olmedo', // Jugador de fútbol, 19 años, busca beca
    tier: BASICO,
    start: daysFromNow(-7), // la semana pasada
    sessionStatus: 'COMPLETED',
    bancardSuffix: '11001',
  })

  await createPacienteConSesion({
    email: 'valentina.torres@demo.com',
    name: 'Valentina Torres', // Nadadora competitiva, 22 años
    tier: ESTANDAR,
    start: atTime(1, 9, 0), // mañana a las 09:00
    sessionStatus: 'CONFIRMED',
    bancardSuffix: '11002',
  })

  await createPacienteConSesion({
    email: 'matias.cardozo@demo.com',
    name: 'Matías Cardozo', // Tenista, próxima sesión en 2 días
    tier: PREMIUM,
    start: daysFromNow(2),
    sessionStatus: 'CONFIRMED',
    bancardSuffix: '11003',
  })

  // Padres de atletas (segundo target)
  await createPacienteConSesion({
    email: 'roberto.gimenez@demo.com',
    name: 'Roberto Giménez', // Padre de jugador de básquet de 16 años
    tier: BASICO,
    start: daysFromNow(-3), // hace 3 días
    sessionStatus: 'COMPLETED',
    bancardSuffix: '11004',
  })

  await createPacienteConSesion({
    email: 'laura.fernandez@demo.com',
    name: 'Laura Fernández', // Madre de gimnasta de 14 años
    tier: ESTANDAR,
    start: daysFromNow(4),
    sessionStatus: 'CONFIRMED',
    bancardSuffix: '11005',
  })

  // Sesión en las próximas horas — para mostrar recordatorios
  await createPacienteConSesion({
    email: 'fernando.rojas@demo.com',
    name: 'Fernando Rojas',
    tier: ESTANDAR,
    start: hoursFromNow(2),
    sessionStatus: 'CONFIRMED',
    bancardSuffix: '11006',
    roomUrl: 'https://meet.google.com/demo-link-xyz',
  })

  // En proceso de aprobación — sin sesión todavía
  await prisma.user.create({
    data: {
      email: 'diego.aquino@demo.com',
      name: 'Diego Aquino',
      passwordHash: bcrypt.hashSync('Patient.123', 10),
      role: 'PATIENT',
      status: 'PROSPECT',
      createdAt: daysFromNow(-1), // agendó ayer
    },
  })

  await prisma.user.create({
    data: {
      email: 'carolina.nunez@demo.com',
      name: 'Carolina Núñez',
      passwordHash: bcrypt.hashSync('Patient.123', 10),
      role: 'PATIENT',
      status: 'PROSPECT',
      createdAt: hoursFromNow(-2), // agendó hace 2 horas
    },
  })

  // ── Compras del libro ────────────────────────────────────────────────────
  await prisma.bookPurchase.create({
    data: {
      email: 'ana.benitez@demo.com', nombre: 'Ana Benitez',
      shopProcessId: '99910101', status: 'CONFIRMED',
      downloadToken: 'demo-token-ana-001', downloadedAt: daysFromNow(-1),
    },
  })
  await prisma.bookPurchase.create({
    data: {
      email: 'jorge.villalba@demo.com', nombre: 'Jorge Villalba',
      shopProcessId: '99910102', status: 'CONFIRMED',
      downloadToken: 'demo-token-jorge-002', downloadedAt: daysFromNow(-3),
    },
  })
  await prisma.bookPurchase.create({
    data: {
      email: 'patricia.molina@demo.com', nombre: 'Patricia Molina',
      shopProcessId: '99910103', status: 'CONFIRMED',
      downloadToken: 'demo-token-patricia-003', // confirmado pero aún no descargado
    },
  })
  await prisma.bookPurchase.create({
    data: {
      email: 'andres.fleitas@demo.com', nombre: 'Andrés Fleitas',
      shopProcessId: '99910104', status: 'CONFIRMED',
      downloadToken: 'demo-token-andres-004',
    },
  })
  await prisma.bookPurchase.create({
    data: {
      email: 'sofia.ramirez@demo.com', nombre: 'Sofía Ramírez',
      shopProcessId: '99910105', status: 'PENDING',
    },
  })

  // ── Métricas reales, calculadas de lo que se acaba de insertar ─────────────
  const patients = await prisma.user.findMany({ where: { email: { endsWith: DEMO_DOMAIN } } })
  const sessions = await prisma.session.findMany({ where: { patientId: { in: patients.map(p => p.id) } } })
  const payments = await prisma.payment.findMany({ where: { patientId: { in: patients.map(p => p.id) }, status: 'CONFIRMED' } })
  const bookPurchases = await prisma.bookPurchase.findMany({ where: { email: { endsWith: DEMO_DOMAIN } } })

  const totalPacientes      = patients.length
  const sesionesConfirmadas = sessions.filter(s => s.status === 'CONFIRMED' || s.status === 'COMPLETED').length
  const prospectosNuevos    = patients.filter(p => p.status === 'PROSPECT').length
  const proximaSesion       = sessions
    .filter(s => s.start && s.start.getTime() > Date.now())
    .sort((a, b) => a.start!.getTime() - b.start!.getTime())[0]

  const ventasLibroConfirmadas = bookPurchases.filter(b => b.status === 'CONFIRMED').length
  const pagosLibroPendientes   = bookPurchases.filter(b => b.status === 'PENDING').length

  const ingresosSesiones = payments.reduce((sum, p) => sum + p.amount, 0)
  const ingresosLibro    = bookPurchases
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + parseFloat(b.amount), 0)

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════╗
║           DEMO SEED COMPLETADO                ║
╠══════════════════════════════════════════════╣
║  👤 Admin: diego@diegoferreira.coach          ║
║     Password: Admin.123                       ║
╠══════════════════════════════════════════════╣
║  MÉTRICAS DEL PANEL:                          ║
║  📋 Total pacientes:      ${String(totalPacientes).padEnd(20)}║
║  ✅ Sesiones confirmadas: ${String(sesionesConfirmadas).padEnd(20)}║
║  ⏳ Prospectos nuevos:    ${String(prospectosNuevos).padEnd(20)}║
║  📅 Próxima sesión: ${(proximaSesion ? describeUpcoming(proximaSesion.start!) : 'sin datos').padEnd(26)}║
╠══════════════════════════════════════════════╣
║  LIBRO:                                       ║
║  💰 Ventas confirmadas:  ${String(ventasLibroConfirmadas).padEnd(21)}║
║  ⏳ Pagos pendientes:    ${String(pagosLibroPendientes).padEnd(21)}║
╠══════════════════════════════════════════════╣
║  INGRESOS SIMULADOS:                          ║
║  💵 Sesiones: PYG ${formatMiles(ingresosSesiones).padEnd(28)}║
║  📚 Libro: USD ${ingresosLibro.toFixed(2).padEnd(31)}║
╚══════════════════════════════════════════════╝
`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
