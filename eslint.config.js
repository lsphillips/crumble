import protectMeFromMyStupidity from 'eslint-config-protect-me-from-my-stupidity';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default [
	{
		ignores : ['crumble.js', 'crumble.cjs']
	},
	...protectMeFromMyStupidity()
];
