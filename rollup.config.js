import babel from 'rollup-plugin-babel'

export default {
  input: './lib/index.js',
  output: {
    file: 'dist/xexeu-view.min.js',
    format: 'iife',
    name: "Xexeu"
  },
  sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}
