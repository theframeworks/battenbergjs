const babel = require('gulp-babel');
const cheerio = require('gulp-cheerio');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const csswrap = require('gulp-css-wrap');
const embed = require('gulp-embed');
const fs = require('fs');
const gulp = require('gulp-param')(require('gulp'), process.argv);
const htmlmin = require('gulp-htmlmin');
const image = require('gulp-image');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const zip = require('gulp-zip');

// google key
const gKey = 'AIzaSyDK79RuzuoAhl8h6ao6bZN1bU5zJAzD0oY';

gulp.task('clean', function () {
    return gulp.src('../dist', { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('scrape', function (url) {
    return scrape({ urls: [url], directory: '../dist' });
});

gulp.task('css', function () {
    return gulp.src('../dist/css/*')
        .pipe(cssnano({
            autoprefixer: false,
            discardComments: {
                removeAll: true,
            },
            mergeLonghand: false,
            zindex: false,
        }))
        .pipe(csswrap({ selector: '#ibm-garage-container' }))
        .pipe(gulp.dest('../dist/css'));
});

gulp.task('html', function () {
    return gulp.src('../dist/*.html')
        .pipe(embed())
        .pipe(cheerio(function ($) {
            // remove webflow data attributes
            // _ apparently removing 'data-wf-page' breaks the js
            ['domain', '_page', 'site'].forEach(function (attr) {
                $(`[data-wf-${attr}]`).removeAttr(`data-wf-${attr}`);
            });
            // remove webflow meta generator
            $('head > meta[name="generator"]').remove();
            // remove crossorigin="anonymous" attribute from scripts
            $('script[crossorigin="anonymous"]').removeAttr('crossorigin');

            /*
             * IBM garage stuff  
             */
            $('head').append('<link href="css/ibm-garage-360.css" rel="stylesheet">')
                .append($('<script>').text('var TFS = TFS || {}'))
                .append($('<script>').text('TFS.map = function () { (new IBMMap()).init() }'))
                .append('<script src="js/ibm-garage-map.js">')
                .append(`<script src="https://maps.googleapis.com/maps/api/js?key=${gKey}&callback=TFS.map" async>`);

            $('body').append('<script src="js/ibm-garage-360.js">');

            var $opening = $([

                '<svg width="10" height="10" class="opening">',
                '<circle cx="50%" cy="50%" r="50%" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" class="opening__path">',
                '</svg>'

            ].join(''));

            $('#pano').append($opening.clone().addClass('opening--left'))
                .append($opening.clone().addClass('opening--right'));


            // IBM shell integration

            fs.writeFileSync('../dist/naked.html', $.html());

            var $ibm = require('cheerio').load(fs.readFileSync('ibm-shell.html'));
            // simulate some content height for the shell in order to debug it
            var $height = $('<style>').text('#ibm-top { margin-bottom: 200vh }');
            $ibm('head').append($height);
            fs.writeFileSync('../dist/shell.html', $ibm.html());
            $height.remove();

            var $head = $('head').children('meta[name="viewport"], link[rel="stylesheet"], style, script');
            var $body = $('body').children();

            $ibm('html').attr('data-wf-page', $('html').attr('data-wf-page'));

            $ibm('head').append($head).append('<link href="css/ibm-garage-shell.css" rel="stylesheet">');

            $ibm('body').append('<script src="js/ibm-garage-shell.js">');

            $ibm('#ibm-top').append($body);

            $('html').replaceWith($ibm('html'));
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
        }))
        .pipe(gulp.dest('../dist'));
});

gulp.task('images:img', function () {
    return gulp.src('../dist/images/*')
        .pipe(image())
        .pipe(gulp.dest('../dist/images'));
});
gulp.task('images:svg', function () {
    return gulp.src('../dist/fonts/*')
        .pipe(image())
        .pipe(gulp.dest('../dist/fonts'));
});

gulp.task('js', function () {
    return gulp.src('../dist/js/*')
        .pipe(uglify())
        .pipe(gulp.dest('../dist/js'));
});

gulp.task('zip', function () {
    return gulp.src(['../dist/**/*', '!../dist/dist.zip'])
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('../dist'));
});

gulp.task('map:images', function () {
    return gulp.src('../ibm-garage-map/src/images/**/*')
        // .pipe(image())
        .pipe(gulp.dest('../dist/images'));
});

gulp.task('map:js', function () {
    return gulp.src([
        '../ibm-garage-map/src/markerclusterer.js',
        '../ibm-garage-map/src/ibm_map.js',
    ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('ibm-garage-map.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('../dist/js'));
});

gulp.task('vr:css', function () {
    return gulp.src('../src/ibm-garage.scss')
        .pipe(sass())
        .pipe(cssnano({
            discardComments: {
                removeAll: true,
            },
            mergeLonghand: false,
            zindex: false,
        }))
        .pipe(rename('ibm-garage-360.css'))
        .pipe(gulp.dest('../dist/css'));
});

gulp.task('vr:icons', function () {
    return gulp.src('../src/icons/**/*')
        .pipe(image())
        .pipe(gulp.dest('../dist/icons'));
});

gulp.task('vr:tiles', function () {
    return gulp.src('../src/tiles/**/*')
        .pipe(image())
        .pipe(gulp.dest('../dist/tiles'));
});

gulp.task('vr:js', function () {
    return gulp.src([
        '../lib/NoSleep.js',
        '../lib/screenfull.min.js',
        '../lib/sceneDataDesktop.js',
        '../lib/sceneDataVR.js',
        '../lib/marzipano.js',
        '../lib/DeviceOrientationControlMethod.js',
        '../src/MarzipanoViewer.js',
        '../src/DesktopViewer.js',
        '../src/VRViewer.js',
        '../src/viewSwitch.js',
    ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env'],
            ignore: ['../lib/NoSleep.js'],
        }))
        .pipe(uglify())
        .pipe(concat('ibm-garage-360.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('../dist/js'));
});

gulp.task('shell:css', function () {
    return gulp.src('ibm-garage-shell.scss')
        .pipe(sass())
        .pipe(cssnano({
            discardComments: {
                removeAll: true,
            },
            mergeLonghand: false,
            zindex: false,
        }))
        .pipe(gulp.dest('../dist/css'));
});

gulp.task('shell:js', function () {
    return gulp.src('ibm-garage-shell.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env'],
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('../dist/js'));
});



gulp.task('default', sequence(
    'clean', 'scrape',
    [
        'css', 'images:img', 'images:svg', 'js',
        'shell:css', 'shell:js',
        'map:images', 'map:js',
        'vr:css', 'vr:icons', 'vr:tiles', 'vr:js',
    ],
    'html', 'zip'
));

gulp.task('watch', [
    'shell:css', 'shell:js',
    'map:images', 'map:js',
    'vr:css', 'vr:icons', 'vr:tiles', 'vr:js',
], function () {
    gulp.watch(['*.scss'], ['shell:css']);
    gulp.watch(['*.js'], ['shell:js']);
    gulp.watch(['../ibm-garage-map/src/images/**/*'], ['map:images']);
    gulp.watch(['../ibm-garage-map/src/**/*.js'], ['map:js']);
    gulp.watch(['../src/**/*.scss'], ['vr:css']);
    gulp.watch(['../src/icons/**/*'], ['vr:icons']);
    gulp.watch(['../src/tiles/**/*'], ['vr:tiles']);
    gulp.watch(['../lib/**/*.js', '../src/**/*.js'], ['vr:js']);
});
