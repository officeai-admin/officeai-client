import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // The Express + AI SDK backend (server/) has been removed. Once the other
  // team's API is wired in, add a proxy entry here pointing "/api" (or
  // whatever paths are used) at that backend.
});
