// Gulpfile.js 

var gulp   = require('gulp'),
    config = {
        cwd: __dirname,
        paths: {
            dest: './dist',
            scripts: ['src/*.js', 'src/**/*.js'],
            tests: {
                unit: ['test/*.spec.js', 'test/**/*.spec.js', 'test/commands/**/*.spec.js']
            }
        }
    };

var args  = require('yargs')(process.argv)
                .string('only')
                .default('only', undefined)
                .argv;

gulp.task('lint', function() {
    var eslint = require('gulp-eslint');
    var join = require('path').join;
    return gulp.src(config.paths.scripts)
        .pipe(eslint({
            configFile: join(config.cwd, '.eslintrc')
        }))
        .pipe(eslint.formatEach('stylish'));
});

gulp.task('transpile', ['lint'], function() {
    var babel = require('gulp-babel');

    return gulp.src(config.paths.scripts, {base: './src'})
        .pipe(babel({
            presets: ['es2015', 'stage-3'],
            plugins: ['transform-runtime']
        }))
        .on('error', function(err) {
            console.error(err);
        })
        .pipe(gulp.dest(config.paths.dest));
});

gulp.task('test', ['transpile'], function() {
    var mocha = require('gulp-mocha');
    return gulp.src(config.paths.tests.unit)
        .pipe(mocha({
            ui: 'tdd',
            reporter: 'spec',
            grep: args.only,
            js: require('babel-register')({
                presets: ['es2015', 'stage-3'],
                plugins: ['transform-runtime']
            })
        }));
});

gulp.task('watch', ['test'], function() {
    gulp.watch(config.paths.tests.unit, ['test']);
    gulp.watch(config.paths.scripts, ['test']);
});

gulp.task('clean', function(done) {
    var del = require('del');
    del([config.paths.dest], done);
});

gulp.task('default', ['test']);
