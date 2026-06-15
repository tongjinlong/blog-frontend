import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import AutoImport from "unplugin-auto-import/vite";
import IconResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";
import compression from "vite-plugin-compression";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        resolvers: [ElementPlusResolver(), IconResolver({ prefix: "Icon" })],
        dts: "src/auto-import.d.ts",
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconResolver({ enabledCollections: ["ep"] }),
        ],
        dts: "src/components.d.ts",
      }),
      Icons({ autoInstall: false }),
      createSvgIconsPlugin({
        iconDirs: [
          fileURLToPath(new URL("./src/assets/icons", import.meta.url)),
        ],
        symbolId: "icon-[dir]-[name]",
      }),
      compression({ algorithm: "gzip" }),
      visualizer({
        filename: "dist/stats/html",
        gzipSize: true,
        brotliSize: true,
      }),
    ],

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    server: {
      port: Number(env.VITE_PORT || 5173),
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },

    build: {
      sourcemap: env.VITE_SOURCEMAP === "true",

      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "vue",
                test: /\/node_modules\/(?:vue|@vue|vue-router|pinia)\//,
              },
              {
                name: "element",
                test: /\/node_modules\/element-plus\//,
              },
              {
                name: "three",
                test: /\/node_modules\/three\//,
              },
            ],
          },
        },
      },
    },
  };
});
