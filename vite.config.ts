import { defineConfig } from "vite"; // <-- use vite, not vitest
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./src-site",
  build: {
    outDir: "../dist",
    minify: "terser", // optional, for JS
    // cssMinify is automatic, no need to set
  },
});
