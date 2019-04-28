'use strict';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const commonjs   = require('rollup-plugin-commonjs');
const buble      = require('rollup-plugin-buble');
const { uglify } = require('rollup-plugin-uglify');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

module.exports = function build ()
{
	return {

		plugins :
		[
			commonjs(),
			buble(),
			uglify()
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