import { parse, resolve } from 'path';
import { defineConfig, UserConfigExport } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  publicDir: 'src/static',
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src', 'background', 'index.ts'),        
        editor: resolve(__dirname, 'src', 'editor.html'),
        popup: resolve(__dirname, 'src', 'popup.html')
      },
      output: {
        dir: "dist",
        chunkFileNames: "[name].[hash].js",
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          const { name } = parse(assetInfo.name);
          return `${name}.[ext]`;
        },
      },
    }
  }
} as UserConfigExport);