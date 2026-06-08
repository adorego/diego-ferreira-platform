import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { PrismaPg }     from '@prisma/adapter-pg'

export default defineConfig({
  earlyAccess: true,
  datasources: {
    db: {
      adapter: () => new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
    },
  },
})
