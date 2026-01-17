import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const apiProxy = process.env.VITE_API_PROXY || "http://127.0.0.1:5000";
  return ({
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy any request starting with /api to the backend
        "/api": {
          target: apiProxy,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
});
