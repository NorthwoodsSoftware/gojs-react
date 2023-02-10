import fs from 'fs-extra';
import * as path from 'path';

const out = path.resolve(fs.realpathSync(process.cwd()), './lib/index.js');
const contents = `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/gojsreact.production.min.js');
} else {
  module.exports = require('./cjs/gojsreact.development.js');
}
`;
fs.writeFile(out, contents);