module.exports = function(grunt) {
	// Project configuration
	grunt.initConfig({
		// Make the contents of package.json available to the rest of the file
		pkg: grunt.file.readJSON('package.json'),

		// Configuring jshint
		jshint: {
			// Run jslint on all javascript files.
			all: [
				'Gruntfile.js',
				'controllers/*.js'
			],
		},

		// Configuring watch
		watch: {
			scripts: {
				files: ['Gruntfile.js', 'controllers/**/*.js', 'models/**/*.js', 'public/**/*.js', '*.js'],
				tasks: ['jshint']
			}
		}
	});

	// Enabling the plugins
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
};