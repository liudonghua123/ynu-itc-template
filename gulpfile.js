const gulp = require('gulp');
const inject = require('gulp-inject');
const bowerFiles = require('main-bower-files');
const es = require('event-stream');
const gls = require('gulp-live-server');
const watch = require('gulp-watch');
const del = require('del');
const pug = require('gulp-pug');

const templateHtmlFiles = ['./src/index.html', './src/list.html', './src/article.html'];

gulp.task('clean', function () {
    return del(['dist']);
});

gulp.task('pug', function() {
    return gulp.src('src/templates/*.pug')
        .pipe(pug({
            // Your options in here.
            pretty: true
        }))
        .pipe(gulp.dest('./src/'));
});

gulp.task('watchPug', function () {
    return gulp.watch('src/templates/*.pug', function (file) {
        gulp.start('pug');
    });
});

// Copy all static bower files
gulp.task('bower', function () {
    return gulp.src(bowerFiles({
        overrides: {
            bootstrap: {
                main: [
                    './dist/js/bootstrap.js',
                    './dist/css/*.min.*',
                    './dist/fonts/*.*'
                ]
            }
        }
    }), {base: 'bower_components'})
        .pipe(gulp.dest('./src/vendor/'));
});

gulp.task('inject', ['bower'], function () {
    return gulp.src(templateHtmlFiles)
        .pipe(inject(gulp.src(['./src/vendor/**/*.js', './src/vendor/**/*.css'], {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(inject(gulp.src(['./src/**/*.js', './src/**/*.css', '!./src/vendor/**/*.js', '!./src/vendor/**/*.css'], {read: false}), {relative: true}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
    return gulp.watch(templateHtmlFiles, function (file) {
        gulp.start('inject');
    });
});

gulp.task('resources', function () {
    gulp.src(['./src/**/*', '!./src/index.html', '!./src/list.html', '!./src/article.html'], {base: 'src'})
        .pipe(gulp.dest('./dist/'));
    return gulp.watch(['./src/**/*'], function (file) {
        gulp.src(['./src/**/*', '!./src/index.html', '!./src/list.html', '!./src/article.html'], {base: 'src'})
            .pipe(gulp.dest('./dist/'));
    });
});

gulp.task('serve', ['resources'], function () {
    var server = gls.static(['dist'], 8000);
    server.start();
    //use gulp.watch to trigger server actions(notify, start or stop)
    return gulp.watch(['./dist/**/*'], function (file) {
        server.notify.apply(server, [file]);
    });
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['pug', 'watchPug', 'bower', 'inject', 'watch', 'serve']);