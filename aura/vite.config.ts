import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  // Expose DEMO_MODE to both Node and Vite client code
  define: {
    "process.env.DEMO_MODE": JSON.stringify(process.env.DEMO_MODE || ""),
    "import.meta.env.VITE_DEMO_MODE": JSON.stringify(process.env.DEMO_MODE || ""),
  },
});