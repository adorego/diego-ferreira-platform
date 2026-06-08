import * as React from "react";
import { Box } from "@mui/material";
import HeroSplit from "@/components/HeroSplit";
import Footer from "@/components/Footer";
import IdentificacionSection from "@/components/IdentificacionSection";
import AutoridadSection from "@/components/AutoridadSection";
import PromesaSection from "@/components/PromesaSection";
import CambiosSection from "@/components/CambiosSection";
import MetodoSection from "@/components/MetodoSection";
import ParaQuienSection from "@/components/ParaQuienSection";
import CierreSection from "@/components/CierreSection";
import PreciosSection from "@/components/PreciosSection";

const BG = "#FAFAF5";
const TEXT = "#2B2B2B";

export default function CoachingElitePage() {
  return (
    <Box sx={{ bgcolor: BG, color: TEXT }}>
      <HeroSplit
        videoUrl="https://res.cloudinary.com/doirhlsxv/video/upload/v1771795140/VIDEO_WEBSITE_y7zrfu.mp4"
      />
      <IdentificacionSection />
      <AutoridadSection />
      <PromesaSection />
      <CambiosSection />
      <MetodoSection />
      <ParaQuienSection />
      <CierreSection />
      <PreciosSection />
      <Footer />
    </Box>
  );
}
