import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const isBrowser = String(process.env.NODE_ENV).includes('browser');
const isBrowserDev = String(process.env.NODE_ENV).includes('browserdev');
const isTest = String(process.env.NODE_ENV).includes('cli');

const name = 'abacus';
const input = `src/index.js`;
let output;

if (isBrowserDev) {
	output = {name, file: 'dist/browser.dev.js', format: 'umd', sourcemap: 'inline'};
} else if (isBrowser) {
	output = {name, file: 'dist/browser.js', format: 'umd'};
} else {
	output = {name, file: 'dist/index.js', format: 'cjs', sourcemap: 'inline'};
}

const babelPresets = {
	corejs: 3,
	loose: true,
	modules: false,
	targets: 'last 2 chrome versions, last 2 edge versions, last 2 firefox versions, last 2 safari versions, last 2 ios versions',
	useBuiltIns: 'entry'
};

if (isTest) 
	babelPresets['modules'] = 'cjs';

const plugins = [
	babel()
].concat(
	isBrowser ? [
		nodeResolve(),
		commonjs(),
		babel({
			babelrc: false,
			presets: [['@babel/env', babelPresets]]
		})
	] : [],
	isBrowser && !isBrowserDev ? terser() : []
);

export default { 
	input, output, plugins
};
