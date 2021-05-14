import { babel }  from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default {

	plugins :
	[
		babel({
			babelHelpers : 'bundled'
		}),
		terser()
	],

	input : 'src/crumble.js',

	output :
	{
		file : 'crumble.cjs',
		format : 'umd',
		name : 'crumble',
		exports : 'named'
	}
};
