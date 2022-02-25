import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import styleImport, { ElementPlusResolve } from "vite-plugin-style-import";

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
      imports: ["vue"],
      dts: "src/auto-import.d.ts",
    }),
    styleImport({
      resolves: [ElementPlusResolve()],
    }),
  ],
});
