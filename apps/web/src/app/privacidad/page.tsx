import { Box, Typography } from "@mui/material";

export const metadata = { title: "Política de privacidad | Diego Ferreira" };

export default function PrivacidadPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 16, color: "#2B2B2B" }}>
      <Typography component="h1" variant="h3" fontWeight={800} mb={4}>
        Política de privacidad
      </Typography>
      <Typography lineHeight={1.8} color="text.secondary">
        En esta página encontrarás la política de privacidad de Diego Ferreira.
        La información recolectada a través de este sitio es utilizada únicamente
        para brindar el servicio de coaching. No se comparte con terceros. Para
        más información escribí a contacto@diegoferreira.com.
      </Typography>
    </Box>
  );
}
