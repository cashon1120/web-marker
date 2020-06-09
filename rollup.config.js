import { terser} from 'rollup-plugin-terser'
import {eslint } from 'rollup-plugin-eslint';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'web-marker',
    sourcemap: true
  },
  plugins: [
    eslint(),
    terser()
  ]
};