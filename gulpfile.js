//default gulp init-ekrz 0.1.0

/*

Activity log :
0.1.0 : replace clean-css by csso
0.0.14 : replace clean-css by csso
0.0.13 : added HTML partials

NOTE: see more history on github (https://github.com/ekrz/init-ekrz).

  .-"""-.
 /      o\
|    o   0).-.
|       .-;(_/     .-.
 \     /  /)).---._|  `\   ,
  '.  '  /((       `'-./ _/|
    \  .'  )        .-.;`  /
     '.             |  `\-'
       '._        -'    /
          ``""--`------`
*/

// tl;dr => 'gulp' to launch dev mode (browser-sync, compress images but do not strike .CSS and .JS rendering)


'use strict';

var gulp = require('gulp'),

  autoprefixer = require('autoprefixer'),
  browserSync = require("browser-sync"),
  cache = require('gulp-cache'),
  changed = require('gulp-changed'),
  clone = require('gulp-clone'),
  csso = require('postcss-csso'),
  injectPartials = require('gulp-inject-partials'),
  imagemin = require('gulp-imagemin'),
  notify = require("gulp-notify"),
  postcss = require('gulp-postcss'),
  prettify = require('gulp-jsbeautifier'),
  rimraf = require('rimraf'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  watch = require('gulp-watch'),
  webp = require('gulp-webp'),

  reload = browserSync.reload;

//definition of our paths, we store them in a var.
// => Reusable and editable in only one place

var path = {
  build: {
    html: 'build/',
    scripts: 'build/js/',
    // styles: 'build/styles/',
    images: 'build/images/',
    assets: 'build/assets/',
    contentFiles: 'build/contentFiles/',
    fonts: 'build/fonts/',
    sass: 'build/styles/'
    // sounds: 'build/sounds/'
  },
  src: {
    html: 'src/**/*.html',
    scripts: 'src/js/**/*.js',
    styles: 'src/styles/**/*.css',
    images: 'src/images/**/*.+(png|jpg|gif|svg|ico)',
    assets: 'src/assets/**/*.*',
    contentFiles: 'src/contentFiles/**/*.+(png|jpg|gif|svg|ico)',
    fonts: 'src/fonts/**/*.*',
    sass: 'src/scss/**/*.scss'
    // sounds: 'src/sounds/**/*.*'
  },
  watch: {
    html: 'src/**/*.html',
    scripts: 'src/js/**/*.js',
    styles: 'src/styles/**/*.css',
    sass: 'src/scss/**/*.scss',
    images: 'src/images/**/*.+(png|jpg|gif|svg|ico)',
    assets: 'src/assets/**/*.*',
    contentFiles: 'src/contentFiles/**/*.+(png|jpg|gif|svg|ico)',
    fonts: 'src/fonts/**/*.*'
    // sounds: 'src/sounds/**/*.*'
  },
  clean: './build'
};


// config our localserver
var config = {
  server: {
    baseDir: "./build"
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: "server"
};

//task for the localserver
gulp.task('webserver', function() {
  browserSync(config);
});

//-------------------------------------------------------------
//   _build : dev workflow, used while development is active
//-------------------------------------------------------------

// HTML and partials
gulp.task('html:build', function() {
  gulp.src(path.src.html)
    .pipe(changed(path.build.html))
    .pipe(injectPartials())
    .pipe(prettify())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({
      stream: true
    }));
});

// JavaScript
gulp.task('scripts:build', function() {
  gulp.src(path.src.scripts)
    .pipe(sourcemaps.init())
    .pipe(changed(path.build.scripts))
    .pipe(prettify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.scripts))
    .pipe(reload({
      stream: true
    }));
});

// Post-css plugins
var plugins = [
  autoprefixer({browsers: ['last 2 versions']}),
  csso({restructure: false, debug: true})
];
// Styles (pure .CSS)
gulp.task('styles:build', function() {
  gulp.src(path.src.styles)
    .pipe(sourcemaps.init())
    .pipe(changed(path.build.styles))
    .pipe(postcss(plugins))
    .pipe(gulp.dest(path.build.styles))
    .pipe(sourcemaps.write())
    .pipe(reload({
      stream: true
    }));
});

// Styles (Sass)
gulp.task('sass:build', function() {
  return gulp.src(path.src.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error: ', sass.logError))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.build.sass))
    .pipe(reload({
      stream: true
    }));

});

// Images (/images/) as webp
gulp.task('images:build', function() {
  var cloneSink = clone.sink();
  gulp.src(path.src.images)
    .pipe(changed(path.build.images))

    // NOTE : This now converts to Webp + optimisation
    // Imagemin
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    })))

    .pipe(cloneSink) // clone image
    .pipe(webp()) // convert cloned image to WebP
    .pipe(cloneSink.tap()) // restore original image

    .pipe(gulp.dest(path.build.images))

    .pipe(reload({
      stream: true
    }));
});

// Images (/contentFiles/) as webp
gulp.task('contentFiles:build', function() {
  var cloneSink = clone.sink();
  gulp.src(path.src.contentFiles)
    .pipe(changed(path.build.contentFiles))

    // NOTE : This now converts to Webp + optimisation
    // Imagemin
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    })))

    .pipe(cloneSink) // clone image
    .pipe(webp()) // convert cloned image to WebP
    .pipe(cloneSink.tap()) // restore original image

    .pipe(gulp.dest(path.build.contentFiles))

    .pipe(reload({
      stream: true
    }));
});

// Fonts
gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(changed(path.build.contentFiles))
    .pipe(gulp.dest(path.build.fonts))
    .pipe(reload({
      stream: true
    }));
});

// Any other assets from /assets/
gulp.task('assets:build', function() {
  gulp.src(path.src.assets)
    .pipe(changed(path.build.assets))
    .pipe(gulp.dest(path.build.assets))
});

// Sounds
// gulp.task('sounds:build', function() {
//     gulp.src(path.src.sounds)
//         .pipe(gulp.dest(path.build.sounds))
// });

gulp.task('build', [
  'sass:build',
  'scripts:build',
  'html:build',
  'images:build',
  'contentFiles:build',
  'fonts:build',
  'assets:build'
  // 'sounds:build'
]);

gulp.task('watch', function() {
  watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.styles], function(event, cb) {
    gulp.start('styles:build');
  });
  watch([path.watch.sass], function(event, cb) {
    gulp.start('sass:build');
  });
  watch([path.watch.scripts], function(event, cb) {
    gulp.start('scripts:build');
  });
  watch([path.watch.images], function(event, cb) {
    gulp.start('images:build');
  });
  watch([path.watch.contentFiles], function(event, cb) {
    gulp.start('contentFiles:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
  watch([path.watch.assets], function(event, cb) {
    gulp.start('assets:build');
  });
  // watch([path.watch.sounds], function(event, cb) {
  //     gulp.start('sounds:build');
  // });
});

// Clean => 'gulp clean' / delete the build folder but it's cooler.

gulp.task('clean', function(cb) {
  rimraf(path.clean, cb);
});

// By default we are in dev => 'gulp' and 'gulp-default'

gulp.task('default', ['build', 'webserver', 'watch']);
