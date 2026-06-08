import { Box, Typography } from "@mui/material";

export const metadata = { title: "Términos y condiciones | Diego Ferreira" };

export default function TerminosPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 16, color: "#2B2B2B" }}>
      <Typography component="h1" variant="h3" fontWeight={800} mb={4}>
        Términos y condiciones
      </Typography>
      <Typography lineHeight={1.8} color="text.secondary">
        Al contratar los servicios de coaching de Diego Ferreira, el cliente
        acepta que los resultados dependen del compromiso personal con el proceso.
        El programa tiene una duración de 6 semanas y no incluye reembolsos una
        vez iniciadas las sesiones. Para consultas: contacto@diegoferreira.com.
      </Typography>
    </Box>
  );
}
