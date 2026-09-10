import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RS Motors — Autos usados en Maldonado",
  description:
    "Inventario de autos usados en Maldonado y Punta del Este. Estándar de exigencia, autos de todos los días. Consultá por WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full bg-ground text-ink">{children}</body>
    </html>
  );
}
