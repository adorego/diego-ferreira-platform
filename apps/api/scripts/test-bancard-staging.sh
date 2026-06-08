#!/bin/bash
# Prueba el flujo completo de Bancard en staging
# Uso: bash apps/api/scripts/test-bancard-staging.sh

API_URL=${1:-"http://localhost:4000"}
echo "Probando API en: $API_URL"

echo ""
echo "1. Health check..."
curl -s "$API_URL/health" | python3 -m json.tool

echo ""
echo "2. Generar JWT de prueba (patientId=1, amount=1300, currency=USD)..."
JWT=$(node -e "
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { patientId: 1, amount: 1300, currency: 'USD' },
    process.env.JWT_SECRET || 'dev_secret_cambiar_en_prod',
    { expiresIn: '48h' }
  );
  console.log(token);
")
echo "JWT: ${JWT:0:50}..."

echo ""
echo "3. Crear payment link en Bancard staging..."
RESPONSE=$(curl -s -X POST "$API_URL/payments/create-link" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$JWT\"}")
echo "$RESPONSE" | python3 -m json.tool

PROCESS_ID=$(echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('processId','ERROR'))")
echo ""
echo "Process ID: $PROCESS_ID"

if [ "$PROCESS_ID" = "ERROR" ]; then
  echo "ERROR: No se obtuvo processId. Verificar credenciales de Bancard."
  exit 1
fi

echo ""
echo "4. URL del formulario de pago (abrir en browser):"
echo "   http://localhost:3000/pago?token=$JWT"
echo ""
echo "5. Tarjetas de test Bancard staging:"
echo "   VISA:       4111 1111 1111 1111 | CVV: 123 | Exp: 12/26"
echo "   MasterCard: 5418 6301 1000 0014 | CVV: 277 | Exp: 08/26"
echo "   Bancaria:   8601 0100 0000 0013 | CVV: N/D | Exp: 08/26"
echo ""
echo "6. Luego del pago, verificar webhook en los logs de la API."
echo "   El paciente debe cambiar a status=ACTIVE en la DB."
