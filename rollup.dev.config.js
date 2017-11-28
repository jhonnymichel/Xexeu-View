import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import sourcemaps from 'rollup-plugin-sourcemaps';
import config from './rollup.config';

const { input } = config;
export default {
  input,
  output: {
    file: 'dev/xexeu-view.js',
    format: 'iife',
    name: "Xexeu"
  },
  sourceMap: true,
  plugins: [
    serve('devServer'),
    livereload(),
    sourcemaps()
  ]
}