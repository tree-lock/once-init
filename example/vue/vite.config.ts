import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve, join } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      // ui库解析器，也可以自定义
      resolvers: [ElementPlusResolver()],
      dts: "src/components.d.ts",
      deep: false,
    }),
    AutoImport({
      imports: ["vue", { "@/services/index": [["default", "$"]] }],
      resolvers: [ElementPlusResolver()],
      dts: "src/auto-import.d.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(join(__dirname, "src")),
    },
  },
});
