import { babel } from '@rollup/plugin-babel';
import terser    from '@rollup/plugin-terser';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function bundle (output)
{
	return {

		input : 'src/crumble.js',

		plugins :
		[
			babel({
				babelHelpers : 'bundled'
			}),
			terser()
		],

		output
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default
[
	bundle({
		file : 'crumble.js',
		format : 'esm'
	}),

	bundle({
		file : 'crumble.cjs',
		format : 'umd',
		name : 'crumble',
		exports : 'named'
	})
];
