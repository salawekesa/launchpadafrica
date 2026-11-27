import { loadEnv } from "vite";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = mode === "test" ? path.resolve(__dirname, "tests") : process.cwd();
  const env = loadEnv(mode, envDir, "");
  const apiPort = env.PORT || "3000";
  return {
  envDir,
  test: {
    alias: { "./src/lib/db-service.js": path.resolve(__dirname, "src/lib/db-service.ts") },
    environment: "jsdom",
    globals: true,
    exclude: [...configDefaults.exclude, "**/{deploy-package,fork-launchpad-main,public}/**"],
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
      '/socket.io': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
