import * as esbuild from 'esbuild';

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  packages: 'external'
}

await esbuild.build({
  ...shared,
  outfile: 'dist/index.js',
  format: 'cjs'
});

await esbuild.build({
  ...shared,
  outfile: 'dist/index.esm.js',
  format: 'esm'
});