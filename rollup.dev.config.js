import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import sourcemaps from 'rollup-plugin-sourcemaps';
import config from './rollup.config';
import path from 'path';

const { input } = config;
export default {
  input,
  output: {
    file: 'dev/xexeu-view.js',
    format: 'iife',
    name: "Xexeu"
  },
  sourcemap: true,
  plugins: [
    serve('devServer'),
    livereload({
      watch: [
        path.resolve(__dirname, 'devServer'),
        path.resolve(__dirname, 'src')
      ],
      exts: [ 'html', 'js', 'scss', 'sass', 'css' ]
    }),
    sourcemaps()
  ]
}