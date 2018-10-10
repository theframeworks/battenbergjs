const assign = require('lodash.assign');
const babel = require('gulp-babel');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
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
const log = require('gulplog');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sequence = require('gulp-sequence');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watchify = require('watchify');
const zip = require('gulp-zip');

// google key
const gKey = 'AIzaSyDK79RuzuoAhl8h6ao6bZN1bU5zJAzD0oY';

var browserifyOpts = {
    entries: ['./src/**/*.js'],
    debug: true
};
var opts = assign({}, watchify.args, browserifyOpts);
var b = watchify(browserify(opts));


function bundleJS() {
    return b.bundle()
        // log errors if they happen
        .on('error', log.error.bind(log, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./src'));
}

gulp.task('bundlejs', bundleJS); // so you can run `gulp js` to build the file
b.on('update', bundleJS); // on any dep update, runs the bundler
b.on('log', log.info); // output build logs to terminal


gulp.task('js', function () {
    return gulp.src('../dist/js/*')
        .pipe(uglify())
        .pipe(gulp.dest('../dist/js'));
});

gulp.task('clean', function () {
    return gulp.src('../dist', { read: false })
        .pipe(clean({ force: true }));
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



gulp.task('zip', function () {
    return gulp.src(['../dist/**/*', '!../dist/dist.zip'])
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('../dist'));
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



gulp.task('default', sequence(
    'clean',
    [
        'css', 'images:img', 'images:svg', 'js',
        'vr:css', 'vr:icons', 'vr:tiles', 'vr:js',
    ],
    'html', 'zip'
));

gulp.task('watch', [
    'css', 'images:img', 'images:svg', 'js',
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
