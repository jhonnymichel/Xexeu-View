import config from './rollup.config';

const {input, output, plugins} = config;
output.file = 'demo/xexeu-view.min.js';

export default {
  input, output, plugins
}
