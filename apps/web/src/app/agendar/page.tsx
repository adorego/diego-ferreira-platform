import AgendarSesion from "../components/agendar";

export const metadata = {
  title: "Agendar sesión gratuita | Diego Ferreira",
  description: "Agendá tu entrevista gratuita de 15-20 minutos con Diego Ferreira. Sin compromiso.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; segment?: string; plan?: string }>;
}) {
  const { plan } = await searchParams;
  return <AgendarSesion planFromUrl={plan ?? null} />;
}
