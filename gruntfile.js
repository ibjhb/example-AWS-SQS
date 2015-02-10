module.exports = function(grunt) {

	var nodemonIgnoreFiles = [
		'test/**'
		,'README.md'
		,'node_modules/**'
		,'client/**'
		,'*.spec.js'
		,'logs/**'
		,'.idea/**'
		,'atlassian-ide-plugin.xml'
	];

	grunt.registerTask('server', 'Start a custom web server', function(){
		require('./app.js');
	});

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
		,jshint: {
			files: [
				'gruntfile.js'
				,'cli/**/*.js'
				,'test/**/*.js'
				,'!node_modules/**/*.*'
			]
			, options: {
				jshintrc: '.jshintrc'
			}
		}
		,watch: {
			all :{
				// Run everything
				files: ['cli/**/*.js']
				,tasks: ['jshint', 'simplemocha']

				// Watch Options
				,options: {
					interrupt: true		// If a file is updated during a build, stop and restart the process
				}
			}

			,mocha : {
				// Run everything
				files: ['<%= jshint.files %>', 'test/**/*.spec.js']
				,tasks: ['jshint', 'simplemocha']

				// Watch Options
				,options: {
					interrupt: true		// If a file is updated during a build, stop and restart the process
				}
			}

			,jshint : {
				// Run everything
				files: ['<%= jshint.files %>']
				,tasks: ['jshint']

				// Watch Options
				,options: {
					interrupt: true		// If a file is updated during a build, stop and restart the process
				}
			}
		}
		,nodemon : {
			dev: {
				options : {
					file : 'app.js'
					,ignoredFiles : nodemonIgnoreFiles
					,delayTime : 5
					,debug : true
					,env : {
						PORT : '3030'
						,ACCOUNT : 'dev'
					}
					,nodeArgs : ['--debug']
				}
			}
			,nodeInspector : {
				options : {
					file : 'node-inspector.js'
					,watchedExtensions : [
						'js'
					]
					,exec : 'node-inspector --web-port 8081'
				}
			}
		}
		,concurrent : {
			target : {
				tasks : [
					//	'nodemon:nodeInspector'
					'nodemon:dev'
					,'watch:all'
				]
				,options : {
					logConcurrentOutput : true
				}
			}
		}

		,simplemocha: {
			options: {
				globals: [
					'sinon',
					'chai',
					'should',
					'expect',
					'assert',
					'AssertionError'
				],
				timeout: 3000,
				ignoreLeaks: false,
				// grep: '*.spec',
				ui: 'bdd',
				reporter: 'spec'
			},
			backend: {
				src: [
					// add chai and sinon globally
					//'test/backend/support/globals.js',

					// tests
					'test/**/*.spec.js'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('test', ['jshint', 'simplemocha']);
	grunt.registerTask('dev', ['concurrent:target']);
	grunt.registerTask('default', ['jshint', 'simplemocha', 'concurrent:target']);
};

