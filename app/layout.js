import "./globals.css";

export const metadata = {
  title: "Dinner & Movie Experience | Metrocinemas × Ventu",
  description:
    "Tu noche continúa en Ventu. Disfruta beneficios exclusivos en los mejores restaurantes después del cine. Una experiencia Metrocinemas × Ventu.",
  keywords: "cine, restaurantes, Metrocinemas, Ventu, descuentos, experiencia, Honduras",
  openGraph: {
    title: "Dinner & Movie Experience",
    description: "Tu noche continúa en Ventu. Beneficios exclusivos después del cine.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
