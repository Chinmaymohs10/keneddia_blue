import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

import path from "path";

import { fileURLToPath } from "url";
 
// Get __dirname equivalent in ESM

const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
export default defineConfig({

  // Base path for root deployment

  base: "/",
 
  plugins: [

    react(),

    tailwindcss(),

  ],
 
  resolve: {

    alias: {

      "@": path.resolve(__dirname, "client", "src"),

      "@assets": path.resolve(__dirname, "client", "src", "assets"),

    },

  },
 
  css: {

    postcss: {

      plugins: [],

    },

  },
 
  // Root folder for development

  root: path.resolve(__dirname, "client"),
 
  build: {

    // Output directly to public_html

    outDir: path.resolve(__dirname, "public_html"),

    emptyOutDir: true,

  },

});

 