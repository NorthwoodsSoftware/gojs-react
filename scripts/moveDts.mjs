// Needed since @rollup/plugin-typescript doesn't handle a single .d.ts output correctly
import fs from 'fs-extra';
import * as path from 'path';

const cwd = fs.realpathSync(process.cwd());
const src = path.resolve(cwd, './dist/types');
const dest = path.resolve(cwd, './lib/types');

await fs.move(src, dest);
fs.remove(path.resolve(cwd, './lib/cjs/types'));
fs.remove(path.resolve(cwd, './lib/esm/types'));