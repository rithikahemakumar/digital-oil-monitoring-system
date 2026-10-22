// vite.config.ts
import { defineConfig } from "file:///C:/Users/admin/Desktop/oil_monitoring/Oil-Monitoring1-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/admin/Desktop/oil_monitoring/Oil-Monitoring1-main/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/admin/Desktop/oil_monitoring/Oil-Monitoring1-main/node_modules/vite-plugin-pwa/dist/index.js";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/admin/Desktop/oil_monitoring/Oil-Monitoring1-main/vite.config.ts";
var esToolkitCompatDir = fileURLToPath(new URL("./node_modules/es-toolkit/compat", __vite_injected_original_import_meta_url)).replace(/\\/g, "/");
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "OilWise \u2014 Smart Oil Use",
        short_name: "OilWise",
        description: "Track daily oil intake and build healthier cooking habits.",
        theme_color: "#16a34a",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/dashboard",
        icons: [
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml" }
        ]
      }
    })
  ],
  resolve: {
    alias: [
      { find: /^es-toolkit\/compat\/(.*)$/, replacement: `${esToolkitCompatDir}/$1.mjs` },
      { find: "@", replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)) }
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFxEZXNrdG9wXFxcXG9pbF9tb25pdG9yaW5nXFxcXE9pbC1Nb25pdG9yaW5nMS1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFxEZXNrdG9wXFxcXG9pbF9tb25pdG9yaW5nXFxcXE9pbC1Nb25pdG9yaW5nMS1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9hZG1pbi9EZXNrdG9wL29pbF9tb25pdG9yaW5nL09pbC1Nb25pdG9yaW5nMS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5jb25zdCBlc1Rvb2xraXRDb21wYXREaXIgPSBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvY29tcGF0JywgaW1wb3J0Lm1ldGEudXJsKSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnaWNvbi5zdmcnXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdPaWxXaXNlIFx1MjAxNCBTbWFydCBPaWwgVXNlJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ09pbFdpc2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RyYWNrIGRhaWx5IG9pbCBpbnRha2UgYW5kIGJ1aWxkIGhlYWx0aGllciBjb29raW5nIGhhYml0cy4nLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMxNmEzNGEnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2Y4ZmFmYycsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAgeyBzcmM6ICcvaWNvbi5zdmcnLCBzaXplczogJ2FueScsIHR5cGU6ICdpbWFnZS9zdmcreG1sJyB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbXG4gICAgICB7IGZpbmQ6IC9eZXMtdG9vbGtpdFxcL2NvbXBhdFxcLyguKikkLywgcmVwbGFjZW1lbnQ6IGAke2VzVG9vbGtpdENvbXBhdERpcn0vJDEubWpzYCB9LFxuICAgICAgeyBmaW5kOiAnQCcsIHJlcGxhY2VtZW50OiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSkgfSxcbiAgICBdLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRXLFNBQVMsb0JBQW9CO0FBQ3pZLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxxQkFBcUI7QUFIeU0sSUFBTSwyQ0FBMkM7QUFLeFIsSUFBTSxxQkFBcUIsY0FBYyxJQUFJLElBQUksb0NBQW9DLHdDQUFlLENBQUMsRUFBRSxRQUFRLE9BQU8sR0FBRztBQUd6SCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsVUFBVTtBQUFBLE1BQzFCLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMLEVBQUUsS0FBSyxhQUFhLE9BQU8sT0FBTyxNQUFNLGdCQUFnQjtBQUFBLFFBQzFEO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEVBQUUsTUFBTSw4QkFBOEIsYUFBYSxHQUFHLGtCQUFrQixVQUFVO0FBQUEsTUFDbEYsRUFBRSxNQUFNLEtBQUssYUFBYSxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUMsRUFBRTtBQUFBLElBQzdFO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
