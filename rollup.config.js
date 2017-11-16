import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es'; 

export default {
  input: './src/index.js',
  output: {
    file: 'dist/xexeu-view.min.js',
    format: 'cjs',
    name: "XexeuView"
  },
  plugins: [
    uglify(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}
