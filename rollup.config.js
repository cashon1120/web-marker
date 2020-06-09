import { terser} from 'rollup-plugin-terser'
import {eslint } from 'rollup-plugin-eslint';

const isPrd = process.env.NODE_ENV === 'production';

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
    isPrd && terser()
  ]
};