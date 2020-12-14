import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

export default {
  input: "src/editor.js",
  output: [
    {
      file: 'dist/scripts/editor.js',
      format: "iife",
      sourcemap: false
    }
  ],
  plugins: [
    copy({
      targets: [
        { src: 'package/*', dest: 'dist' }
      ]
    }),
    nodeResolve({
      browser: true,
    }),
    commonjs({
      include: 'node_modules/*/**'
    }),
    postcss({
      babelrc: false,
      plugins: [],
      extract: true,
      minimize: true,
      sourceMap: false,
      babelHelpers: 'runtime'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    terser()
  ]
};