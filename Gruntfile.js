module.exports = function (grunt)
{
	// Dependencies
	// ----------------------------------------------------

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');

	// Configuration
	// ----------------------------------------------------

	grunt.initConfig(
	{
		package : grunt.file.readJSON('package.json'),

		// ------------------------------------------------

		jshint : // https://github.com/gruntjs/grunt-contrib-jshint
		{
			options :
			{
				jshintrc : '.jshintrc'
			},

			src : ['src/Crumble.js', 'test/Crumble.js']
		},

		uglify : // https://github.com/gruntjs/grunt-contrib-uglify
		{
			build :
			{
				files :
				{
					'build/Crumble.js' : 'src/Crumble.js'
				}
			},

			options :
			{
				banner : '// Crumble                                                        \n'
				       + '// Version: <%= package.version %>                                \n'
				       + '// Author: <%= package.author.name %> (<%= package.author.url %>) \n'
				       + '// License: <%= package.license %>                                \n',

				report : 'gzip'
			}
		},

		mochaTest :
		{
			options :
			{
				reporter : 'spec'
			},

			src : ['test/Crumble.js']
		}
	});
	
	// Task: `test`
	// ----------------------------------------------------
	
	grunt.registerTask('test', ['jshint', 'mochaTest']);
	
	// Task: `build`
	// ----------------------------------------------------
	
	grunt.registerTask('build', ['test', 'uglify']);
	
	// Task `default`
	// ----------------------------------------------------
	
	grunt.registerTask('default', ['build']);
};