import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/docsify-yaml-table.js',
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
    resolve(),
  ]
}