import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { DevUiResolver } from 'unplugin-vue-components/resolvers'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar']
        }
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver(), DevUiResolver()]
    }),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json']
    })
  ],
  define: {
    'process.env': {},
    'process.argv': [],
    'process': {
      env: {},
      argv: [],
      cwd: () => '/',
      platform: 'browser'
    }
  },
  resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'monaco-editor': fileURLToPath(new URL('./node_modules/monaco-editor', import.meta.url))
      }
    },
  worker: {
      format: 'es'
    }
})
