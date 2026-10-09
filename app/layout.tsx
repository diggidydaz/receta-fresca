import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Receta Fresca",
  other: { google: "notranslate" },
  description: "La comida es medicina, y es de aquí. Recetas de alimentos frescos, canjeadas en colmados, fincas y cocinas locales.",
};

// The app has its own Spanish and English. Browser auto-translation mangles food words
// ("estimado" becomes "dear", "pernil" becomes "leg"), so it is switched off.
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#14532d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" translate="no" className="notranslate">
      <body className="flex min-h-dvh flex-col">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
