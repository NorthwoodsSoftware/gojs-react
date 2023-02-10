import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const copyright = '/*! Copyright (C) 1998-2023 by Northwoods Software Corporation. All Rights Reserved. */';
const prodOpts = {
  input: 'src/index.ts',
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    terser()
  ]
};
const devOpts = {
  input: 'src/index.ts',
  plugins: [
    typescript({ tsconfig: './tsconfig.json' })
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
      banner: copyright,
      file: 'dist/gojsreact.production.min.js',
      format: 'umd',
      name: libName,
      globals: umdGlobals,
      esModule: true
    },
    external: umdExternals
  },
  {
    ...prodOpts,
    output: {
      banner: copyright,
      file: 'lib/cjs/gojsreact.production.min.js',
      format: 'cjs',
      esModule: true
    },
    external: modExternals
  },
  // dev builds
  {
    ...devOpts,
    output: {
      banner: copyright,
      file: 'dist/gojsreact.development.js',
      format: 'umd',
      name: libName,
      globals: umdGlobals,
      esModule: true
    },
    external: umdExternals
  },
  {
    ...devOpts,
    output: [
      {
        banner: copyright,
        file: 'lib/cjs/gojsreact.development.js',
        format: 'cjs',
        esModule: true
      },
      {
        banner: copyright,
        file: 'lib/esm/gojsreact.js',
        format: 'esm'
      }
    ],
    external: modExternals
  }
];
