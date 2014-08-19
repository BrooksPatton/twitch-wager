module.exports = function(grunt) {
	// Project configuration
	grunt.initConfig({
		// Make the contents of package.json available to the rest of the file
		pkg: grunt.file.readJSON('package.json'),

		// Configuring jshint
		jshint: {
			// Run jslint on all javascript files.
			all: [
				'config/**/*.js',
				'controllers/**/*.js',
				'models/**/*.js',
				'public/**/*.js',
				'*.js'
			],
			// Run jshint on the javascript files that I directly edit
			preConcat: [
				'config/**/*.js',
				'controllers/**/*.js',
				'models/**/*.js',
				'public/scripts/**/*.js',
				'*.js'
			],
			// Run jshint on the javascript file that contains the concatenated versions of the above js files
			postConcat: [
				'public/js/main.js',
			],
		},

		// Configuring watch
		watch: {
			scripts: {
				files: [
					'config/**/*.js',
					'controllers/**/*.js',
					'models/**/*.js',
					'public/scripts/**/*.js',
					'*.js'
				],
				// We are making sure to run things in the correct order. We don't want to run jshint on the concatenated file before it gets re-written.
				tasks: ['jshint:preConcat',
					'concat',
					'jshint:postConcat',
					'uglify',
				]
			}
		},
		// Configuring concat
		concat: {
			// Seperate each file by a semi-colon
			options: {
				seperator: ';'
			},
			dist: {
				// Order matters here, they will go into the destinate file in the same order that they are listed
				src: ['public/scripts/models/user-model.js',
					 'public/scripts/models/stream-model.js',
					 'public/scripts/models/stream-list.js',
					 'public/scripts/views/fim-view.js',
					 'public/scripts/views/streamer-console-view.js',
					 'public/scripts/views/select-stream-view.js',
					 'public/scripts/views/view-stream-view.js',
					 'public/scripts/views/wagers-view.js',
					 'public/scripts/router/router.js',
					 'public/scripts/main.js'
				],
				// The file that is created with the concated files together
				dest: 'public/js/main.js'
			}
		},

		// Configuring uglify
		uglify: {
			options: {
				// We want all of the variable names to be mangled and compressed. This command makes that happen
				mangle: {toplevel: true},
			},
			build: {
				files: {
					'public/js/main.min.js': ['public/js/main.js']
				}
			}
		}
	});

	// Enabling the plugins
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
};