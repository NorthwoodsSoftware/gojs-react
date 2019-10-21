import banner from 'rollup-plugin-banner';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const copyright = 'Copyright (C) 1998-2019 by Northwoods Software Corporation. All Rights Reserved.';
const prodOpts = {
  input: 'src/index.ts',
  plugins: [
    typescript({
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true
    }),
    terser({
      output: { comments: false }
    }),
    banner(copyright)
  ]
};
const devOpts = {
  input: 'src/index.ts',
  plugins: [
    typescript({
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true
    }),
    banner(copyright)
  ]
};
const libName = 'goJsReact';
const umdGlobals = {
  gojs: 'go',
  react: 'React'
};
const umdExternals = [
  'gojs',
  'react'
];
const modExternals = [
  'gojs',
  'react',
  'tslib'
];

export default [
  // production builds
  {
    ...prodOpts,
    output: {
      file: 'dist/gojsreact.production.min.js',
      format: 'umd',
      name: libName,
      globals: umdGlobals
    },
    external: umdExternals
  },
  {
    ...prodOpts,
    output: {
      file: 'lib/cjs/gojsreact.production.min.js',
      format: 'cjs'
    },
    external: modExternals
  },
  // dev builds
  {
    ...devOpts,
    output: {
      file: 'dist/gojsreact.development.js',
      format: 'umd',
      name: libName,
      globals: umdGlobals
    },
    external: umdExternals
  },
  {
    ...devOpts,
    output: [
      {
        file: 'lib/cjs/gojsreact.development.js',
        format: 'cjs'
      },
      {
        file: 'lib/esm/gojsreact.js',
        format: 'esm'
      }
    ],
    external: modExternals
  }
];
