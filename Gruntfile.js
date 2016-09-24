module.exports = function (grunt)
{
	// Dependencies
	// -------------------------------------------------------

	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-mocha-cli');

	// Configuration
	// -------------------------------------------------------

	grunt.initConfig(
	{
		eslint :
		{
			options :
			{
				useEslintrc : true
			},

			src : ['src/**/*.js', 'tests/**/*.js']
		},

		// ------------------------------------------------------

		mochacli :
		{
			options :
			{
				reporter : 'spec'
			},

			src : ['tests/Crumble.js']
		}
	});

	// Task: `test`
	// -------------------------------------------------------

	grunt.registerTask('test', ['eslint', 'mochacli']);

	// Task: `build`
	// -------------------------------------------------------

	grunt.registerTask('build', ['test']);

	// Task `default`
	// -------------------------------------------------------

	grunt.registerTask('default', ['build']);
};
