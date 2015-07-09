module.exports = function (grunt)
{
	// Dependencies
	// ----------------------------------------------------

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-mocha-cli');

	// Configuration
	// ----------------------------------------------------

	grunt.initConfig(
	{
		package : grunt.file.readJSON('package.json'),

		// ------------------------------------------------

		jshint :
		{
			test :
			{
				options :
				{
					jshintrc : '.jshintrc'
				},

				src : ['src/Crumble.js', 'test/Crumble.js']
			}
		},

		uglify :
		{
			build :
			{
				options :
				{
					banner : '// Crumble                                                        \n'
					       + '// Version: <%= package.version %>                                \n'
					       + '// Author: <%= package.author.name %> (<%= package.author.url %>) \n'
					       + '// License: <%= package.license %>                                \n',

					report : 'gzip'
				},

				files : { 'build/Crumble.js' : 'src/Crumble.js' }
			}
		},

		mochacli :
		{
			test :
			{
				options :
				{
					reporter : 'spec'
				},

				src : ['test/Crumble.js']
			}
		}
	});

	// Task: `test`
	// ----------------------------------------------------

	grunt.registerTask('test', ['jshint:test', 'mochacli:test']);

	// Task: `build`
	// ----------------------------------------------------

	grunt.registerTask('build', ['test', 'uglify:build']);

	// Task `default`
	// ----------------------------------------------------

	grunt.registerTask('default', ['build']);
};
