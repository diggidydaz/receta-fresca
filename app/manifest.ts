import type { MetadataRoute } from "next";

// Lets a patient add Receta Fresca to their phone's home screen with its own icon and name.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Receta Fresca",
    short_name: "Receta Fresca",
    description: "La comida es medicina, y es de aquí.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbf2",
    theme_color: "#14532d",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
