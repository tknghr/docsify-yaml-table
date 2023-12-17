import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/docsify-yaml-table.js',
      format: 'iife'
    },
    {
      file: 'dist/docsify-yaml-table.min.js',
      format: 'iife',
      plugins: [
        terser()
      ]
    }
  ],
  plugins: [
    nodeResolve({browser: true}),
    commonjs(),
    json(),
    resolve(),
    nodePolyfills(),
  ],
  strictDeprecations: true,
}