import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // In local dev, proxy /api/claude to a local function runner
    // Run: netlify dev  (instead of vite directly) for full local testing
    port: 5173,
  },
});
