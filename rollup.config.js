'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const commonjs   = require('rollup-plugin-commonjs');
const buble      = require('rollup-plugin-buble');
const { terser } = require('rollup-plugin-terser');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = function build ()
{
	return {

		plugins :
		[
			commonjs(),
			buble(),
			terser()
		],

		output :
		{
			file : 'Crumble.js',
			format : 'umd',
			name : 'Crumble',
			exports : 'named'
		},

		input : 'src/Crumble.js'
	};
};
