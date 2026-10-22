// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Dominio de publicación. Necesario para que og:image genere una URL
  // absoluta: quien descarga la miniatura es el servidor de WhatsApp, y una
  // ruta relativa no puede resolverla.
  site: 'https://boda-ana-jose-2026.vercel.app',

  vite: {
    plugins: [tailwindcss()]
  }
});