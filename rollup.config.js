import { babel }  from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function plugins ()
{
	return [
		babel({
			babelHelpers : 'bundled'
		}),
		terser()
	];
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default [
	{
		input : 'src/crumble.js',

		output :
		{
			file : 'crumble.js',
			format : 'esm'
		},

		plugins : plugins()
	},
	{
		input : 'src/crumble.js',

		output :
		{
			file : 'crumble.cjs',
			format : 'umd',
			name : 'crumble',
			exports : 'named'
		},

		plugins : plugins()
	}
];
