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
			preConcat: [
				'config/**/*.js',
				'controllers/**/*.js',
				'models/**/*.js',
				'public/scripts/**/*.js',
				'*.js'
			],
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
				tasks: ['jshint:preConcat',
					'concat',
					'jshint:postConcat',
					'uglify',
				]
			}
		},

		concat: {
			options: {
				seperator: ';'
			},
			dist: {
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
				dest: 'public/js/main.js'
			}
		},

		uglify: {
			options: {
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