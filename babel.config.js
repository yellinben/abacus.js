'use strict';

module.exports = {
	plugins: [
		['@babel/proposal-class-properties', {loose: true}],
		['transform-for-of-as-array', {loose: true}],
		['@babel/plugin-proposal-export-default-from']
	],
	presets: [
		['@babel/env', {
			corejs: 3,
			loose: true,
			modules: false,
			targets: {node: 8},
			useBuiltIns: 'entry'
		}]
	]
};
