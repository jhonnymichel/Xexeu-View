import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';
const pkg = require('./package.json');

export default {
  input: './src/index.js',
  moduleName: 'Xexeu',
  targets: [
		{ dest: pkg.main, format: 'umd' },
		{ dest: 'demo/xexeu-view.min.js', format: 'umd' },
		{ dest: pkg.module, format: 'es' }
	],
  output: {
    file: 'dist/xexeu-view.min.js',
    format: 'iife',
    name: "Xexeu"
  },
  plugins: [
    uglify(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}
