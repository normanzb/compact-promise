/*global module:false*/
module.exports = function(grunt) {
    'use strict';

    var SPACE_NAME = 'Defer';
    var EXT_JS = '.js';
    var EXT_JS_MIN = '.min' + EXT_JS;
    var FILE_NAME_OUT_MAX = SPACE_NAME + EXT_JS;
    var FILE_NAME_OUT_MIN = SPACE_NAME + EXT_JS_MIN;
    var FILE_NAME_ENTRY = SPACE_NAME;

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-karma');

    grunt.config.init({
        requirejs : {
            dist : {
                options : {
                    name: FILE_NAME_ENTRY,
                    out: FILE_NAME_OUT_MAX,
                    baseUrl: 'src',
                    optimize: 'none',
                    pragmas: {
                        release: true
                    },
                    skipModuleInsertion: true,
                    onBuildWrite: function(name, path, contents) {
                        return require('amdclean').clean({
                            code: '\'use strict\';\n' + (
                                contents
                                .replace(/\/\/>>excludeStart[^]*?\/\/>>excludeEnd\("release"\);/gm, '')
                                .replace(/'use strict';/gm, '')
                                ),
                            prefixMode: 'camelCase',
                            escodegen: {
                              format: {
                                indent: { style: '    ' }
                              }
                            },
                            removeUseStricts: false
                        });
                    }
                }
            }
        },
        umd: {
            dist: {
                src: FILE_NAME_OUT_MAX,
                objectToExport: SPACE_NAME,
                globalAlias: SPACE_NAME,
                dest: FILE_NAME_OUT_MAX
            }
        },
        uglify : {
            dist : {
                src : [ FILE_NAME_OUT_MAX ],
                dest : FILE_NAME_OUT_MIN
            }
        },
        bumpup: {
            files: ['package.json', 'bower.json']
        },
        tagrelease: {
            file: 'package.json',
            commit:  true,
            message: 'Release %version%',
            prefix:  '',
            annotate: false
        },
        karma: {
          unit: {
            configFile: 'karma.conf.js',
            singleRun: true,
            browsers: ['PhantomJS'],
            phantomjsLauncher: {
              // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
              exitOnResourceError: true
            }
          }
        }
    });

    grunt.registerTask('dist', 'requirejs:dist umd:dist uglify'.split(' '));
    grunt.registerTask('default', 'dist'.split(' '));
    grunt.registerTask('release', function (type) {

        grunt.task.run('dist');
        
        if (type != null && type !== '' && type !== false){
            grunt.task.run('bumpup:' + type);
            grunt.task.run('tagrelease');
        }

    });
};