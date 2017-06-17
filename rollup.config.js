import * as fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'index.js',
  dest: 'build.js',
  format: 'umd',
  sourceMap: false,
  plugins: [
    resolve({
      browser: true,
      basedir: "./"
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
      }
    }),
    replace({
      values: {
	'process.env.NODE_ENV': "'development'"
      }
    }),
    svelte({
      extensions: [ '.html' ]
    }),
    buble()
  ]
};
