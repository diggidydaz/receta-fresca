import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Receta Fresca",
  description: "La comida es medicina, y es de aquí. Recetas de alimentos frescos, canjeadas en colmados, fincas y cocinas locales.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#14532d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
