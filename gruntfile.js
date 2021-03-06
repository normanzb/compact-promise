/*global module:false*/
module.exports = function(grunt) {
    'use strict';

    var DIST = 'dist';
    var SPACE_NAME = 'Promise';
    var EXT_JS = '.js';
    var EXT_JS_MIN = '.min' + EXT_JS;
    var FILE_NAME_OUT_MAX = SPACE_NAME + EXT_JS;
    var FILE_NAME_OUT_MIN = SPACE_NAME + EXT_JS_MIN;
    var FILE_NAME_ENTRY = SPACE_NAME;

    var FILE_NAME_OUT_MAX_NOTICK = DIST + '/' + SPACE_NAME + '.notick' + EXT_JS;
    var FILE_NAME_OUT_MIN_NOTICK = DIST + '/' + SPACE_NAME + '.notick.min' + EXT_JS;
    var FILE_NAME_OUT_MAX_NOEXTNOTICK = DIST + '/' + SPACE_NAME + '.noext.notick' + EXT_JS;
    var FILE_NAME_OUT_MIN_NOEXTNOTICK = DIST + '/' + SPACE_NAME + '.noext.notick.min' + EXT_JS;
    var FILE_NAME_OUT_MAX_NOEXTNOTICKNOUMD = DIST + '/' + SPACE_NAME + '.noumd.noext.notick' + EXT_JS;
    var FILE_NAME_OUT_MIN_NOEXTNOTICKNOUMD = DIST + '/' + SPACE_NAME + '.noumd.noext.notick.min' + EXT_JS;
    var FILE_NAME_OUT_MAX_NOTICK_ES = DIST + '/' + SPACE_NAME + '.notick.es' + EXT_JS;
    var FILE_NAME_OUT_MAX_NOTICK_COMMONJS = DIST + '/' + SPACE_NAME + '.notick.commonjs' + EXT_JS;

    var extend = require('extend');

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-karma');

    function removePragmas(contents) {
        return '\'use strict\';\n' + (
            contents
            .replace(/\/\/>>excludeStart[^]*?\/\/>>excludeEnd\("release"\);/gm, '')
            .replace(/'use strict';/gm, '')
            ).trim()
    }

    var requireOptions = {
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
                code: removePragmas(contents),
                prefixMode: 'camelCase',
                escodegen: {
                  format: {
                    indent: { style: '    ' }
                  }
                },
                removeUseStricts: false,
                wrap: {
                    start:'',
                    end:''
                }
            });
        }
    };

    var extNoTickOptions = extend({}, requireOptions, {
        paths: {
            'tick/simple': 'tick/directCall'
        },
        out: FILE_NAME_OUT_MAX_NOTICK
    });
    var noExtNoTickOptions = extend({}, requireOptions, {
        paths:  {
            'tick/simple': 'tick/directCall',
            'ext/all': 'ext/empty'
        },
        out: FILE_NAME_OUT_MAX_NOEXTNOTICK
    });
    var noExtNoTickNoUMDOptions = extend({}, noExtNoTickOptions, {
        out: FILE_NAME_OUT_MAX_NOEXTNOTICKNOUMD
    });

    var noTickEsOptions = extend({}, extNoTickOptions, {
        out: FILE_NAME_OUT_MAX_NOTICK_ES,
        wrap: {
            start: "",
            end: ";export default Promise;"
        },
    });

    var noTickCommonJSOptions = extend({}, extNoTickOptions, {
        out: FILE_NAME_OUT_MAX_NOTICK_COMMONJS,
        wrap: {
            start: "",
            end: ";module.exports = Promise;"
        },
    })

    grunt.config.init({
        requirejs: {
            dist: {
                options: requireOptions
            },
            extnotick: {
                options: extNoTickOptions
            },
            noextnotick: {
                options: noExtNoTickOptions
            },
            noextnoticknoumd: {
                options: noExtNoTickNoUMDOptions
            },
            extNoTickEs: {
                options: noTickEsOptions
            },
            extNoTickCommonJS: {
                options: noTickCommonJSOptions
            }
        },
        umd: {
            dist: {
                src: FILE_NAME_OUT_MAX,
                objectToExport: SPACE_NAME,
                globalAlias: SPACE_NAME,
                dest: FILE_NAME_OUT_MAX
            },
            extnotick: {
                src: FILE_NAME_OUT_MAX_NOTICK,
                objectToExport: SPACE_NAME,
                globalAlias: SPACE_NAME,
                dest: FILE_NAME_OUT_MAX_NOTICK
            },
            noextnotick: {
                src: FILE_NAME_OUT_MAX_NOEXTNOTICK,
                objectToExport: SPACE_NAME,
                globalAlias: SPACE_NAME,
                dest: FILE_NAME_OUT_MAX_NOEXTNOTICK
            }
        },
        uglify : {
            dist : {
                src : [ FILE_NAME_OUT_MAX ],
                dest : FILE_NAME_OUT_MIN
            },
            extnotick: {
                src : [ FILE_NAME_OUT_MAX_NOTICK ],
                dest : FILE_NAME_OUT_MIN_NOTICK
            },
            noextnotick: {
                src : [ FILE_NAME_OUT_MAX_NOEXTNOTICK ],
                dest : FILE_NAME_OUT_MIN_NOEXTNOTICK
            },
            noextnoticknoumd: {
                src : [ FILE_NAME_OUT_MAX_NOEXTNOTICKNOUMD ],
                dest : FILE_NAME_OUT_MIN_NOEXTNOTICKNOUMD
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

    grunt.registerTask('dist', 'requirejs:dist umd:dist uglify:dist'.split(' '));
    grunt.registerTask('extnotick-es', 'requirejs:extNoTickEs'.split(' '));
    grunt.registerTask('extnotick-commonjs', 'requirejs:extNoTickCommonJS'.split(' '));
    grunt.registerTask('extnotick', 'requirejs:extnotick umd:extnotick uglify:extnotick'.split(' '));
    grunt.registerTask('noextnotick', 'requirejs:noextnotick umd:noextnotick uglify:noextnotick'.split(' '));
    grunt.registerTask('noextnoticknoumd', 'requirejs:noextnoticknoumd uglify:noextnoticknoumd'.split(' '));
    grunt.registerTask('all', 'dist extnotick extnotick-es extnotick-commonjs noextnotick noextnoticknoumd'.split(' '));
    grunt.registerTask('default', 'all'.split(' '));
    grunt.registerTask('release', function (type) {

        grunt.task.run('all');
        
        if (type != null && type !== '' && type !== false){
            grunt.task.run('bumpup:' + type);
            grunt.task.run('tagrelease');
        }

    });
};