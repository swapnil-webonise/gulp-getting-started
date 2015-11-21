var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    gp_uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant')
    jshint = require('gulp-jshint'),
    sonar = require('gulp-sonar'),
    minifyHTML = require('gulp-minify-html');


gulp.task('css-optimization', function(){

    gulp.src(
        [
            'app/css/style.css',
            'app/css/custom.css'
        ]
    )
        .pipe(gp_concat('style.css'))
        .pipe(minifyCSS({keepSpecialComments : 0}))
        .pipe(gp_rename('style.min.css'))
        .pipe(gulp.dest('build/css'))
        .pipe(livereload());
});

gulp.task('js-optimization', function(){

    gulp.src(
        [
            'app/plugins/angular.js',
            'app/js/app.js',
            'app/js/controller.js'
        ]
    )
        .pipe(gp_concat('all.js'))
        .pipe(gp_uglify())
        .pipe(gp_rename('all.min.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(livereload());
});

gulp.task('view-optimization', function() {
    var opts = {
        conditionals: true,
        spare:true
    };

    gulp.src('index.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('build/'))
        .pipe(livereload());
});

gulp.task('image-optimization', function() {
    gulp.src('app/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/images/'))
});

gulp.task('watch', function(){
    var server = livereload.listen();

    gulp.watch('app/css/*.css',['css-optimization']);
    gulp.watch('app/js/*.js',['js-optimization']);
    gulp.watch('index.html',['view-optimization']);
});

gulp.task('server', ['build','watch'], function(){});

gulp.task('build', ['css-optimization','js-optimization','view-optimization','image-optimization'], function(){});

gulp.task('hint', function() {
    return gulp.src('app/js/*')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('gulp-jshint-file-reporter', {
        filename: 'jshint-output.log'
    }));
});

gulp.task('sonar', function () {
    var options = {
        sonar: {
            host: {
                url: 'http://localhost:9005/sonar'
            },
            jdbc: {
                url: 'jdbc:mysql://localhost:3306/sonar',
                username: 'sonar',
                password: 'sonar'
            },
            projectKey: 'sonar:GettingStartedWithGulp:1.0.0',
            projectName: 'GettingStartedWithGulp',
            projectVersion: '1.0.0',
            // comma-delimited string of source directories
            sources: 'app/js',
            language: 'js',
            sourceEncoding: 'UTF-8',
            javascript: {
                lcov: {
                    reportPath: 'build/sonar_report/lcov.info'
                }
            }
        }
    };

    // gulp source doesn't matter, all files are referenced in options object above
    return gulp.src('thisFileDoesNotExist.js', { read: false })
        .pipe(sonar(options))
        .on('error', util.log);
});
