import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path';
import { terser } from "rollup-plugin-terser";
import { replaceWord } from './plugin';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss'

console.log('process ===> ', process.env.BROWSER, process.env.NODE_ENV);
const isChrome = process.env.BROWSER === undefined ? true : process.env.BROWSER === 'chrome';
const from = isChrome ? 'browser' : 'chrome'; // this var for replaceWord plugin
const to = isChrome ? 'chrome' : 'browser'; // this var for replaceWord plugin

if (!isChrome) {
  const content = readFileSync(resolve(process.cwd(), 'manifest-v2.json'), 'utf8');
  writeFileSync(resolve(process.cwd(), 'dist', 'manifest.json'), content)
}

export default [
  {
    input: "src/background/index.js",
    output: {
      file: "dist/background.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  },
  {
    input: "src/popup/index.js",
    output: {
      file: "dist/popup.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [
      postcss({
        extract: true,
      }),
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  },
  {
    input: "src/editor/index.js",
    output: {
      file: "dist/editor.js",
      format: "iife",
      sourcemap: false,
    },
    plugins: [
      postcss({
        extract: true,
      }),
      nodeResolve(),
      commonjs(),
      replaceWord({ from, to }),
      process.env.NODE_ENV === 'production' ? terser() : ''
    ]
  }
]
