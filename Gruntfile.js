module.exports = function (grunt)
{
	// Dependencies
	// -------------------------------------------------------

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-cli');

	// Configuration
	// -------------------------------------------------------

	grunt.initConfig(
	{
		jshint :
		{
			options :
			{
				jshintrc : '.jshintrc'
			},

			src : ['src/Crumble.js', 'tests/Crumble.js']
		},

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

	grunt.registerTask('test', ['jshint', 'mochacli']);

	// Task: `build`
	// -------------------------------------------------------

	grunt.registerTask('build', ['test']);

	// Task `default`
	// -------------------------------------------------------

	grunt.registerTask('default', ['build']);
};
