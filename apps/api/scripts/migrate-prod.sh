#!/bin/bash
# Corre las migraciones de Prisma en Railway
# Uso: railway run --service df-api bash apps/api/scripts/migrate-prod.sh

set -e
echo "Corriendo migraciones..."
cd apps/api
npx prisma migrate deploy
echo "Corriendo seed (usuario admin)..."
npx ts-node prisma/seed.ts
echo "Listo."
