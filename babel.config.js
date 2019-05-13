'use strict';

module.exports = {
	plugins: [
		['@babel/proposal-class-properties', {loose: true}],
		['transform-for-of-as-array', {loose: true}],
		['@babel/plugin-proposal-export-default-from'],
		['dynamic-import-node'],
		['transform-modern-regexp'],
		[require.resolve('babel-plugin-module-resolver'), {
			root: ["./src/"], alias: {"test": "./test"}
		}]
	],
	presets: [
		['@babel/env', {
			corejs: 3,
			loose: true,
			modules: false,
			targets: {node: 'current'},
			useBuiltIns: 'entry'
		}]
	],
	env: {
    test: {
			plugins: [
				'transform-es2015-modules-commonjs',
				'transform-class-properties'
			],
      presets: [
				['@babel/preset-env']
			]
    }
  }
};
