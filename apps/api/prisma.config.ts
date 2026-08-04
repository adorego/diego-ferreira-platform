import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Este archivo lo lee únicamente la CLI de Prisma (migrate, db pull, studio, etc.).
// El runtime de NestJS (PrismaService) instancia su propio PrismaPg con
// process.env.DATABASE_URL y nunca lee prisma.config.ts.
//
// @prisma/config@7.8.0 NO tiene ningún campo para pasarle un driver adapter a la
// CLI — el schema engine que usan migrate/db pull solo acepta una URL de conexión
// plana en `datasource.url` (singular, sin anidar bajo "db"). Los campos
// `datasources` (plural) y `migrate` que tenía este archivo no existen en el tipo
// `PrismaConfig`, así que defineConfig los ignoraba en silencio — de ahí que
// `migrate deploy` siguiera pidiendo `datasource.url` pese a haberlos agregado.
export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // `prisma db seed` ya no lee la clave "prisma.seed" de package.json en esta
  // versión — sin esto, el comando corre pero no ejecuta nada ("No seed command
  // configured"). Se deja también la entrada equivalente en package.json por si
  // algún tooling externo todavía la busca ahí.
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
})
