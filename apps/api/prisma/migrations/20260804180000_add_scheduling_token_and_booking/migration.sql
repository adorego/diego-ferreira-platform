-- AlterEnum
-- No puede ejecutarse dentro del bloque de transacción implícito que usa
-- `prisma migrate deploy` para el resto del archivo — por eso Prisma la separa
-- en su propio statement (ver notas de Postgres sobre ALTER TYPE ... ADD VALUE).
ALTER TYPE "AppStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "schedulingToken" TEXT,
ADD COLUMN     "totalSessions" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "SessionBooking" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "meetLink" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
