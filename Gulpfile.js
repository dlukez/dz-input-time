var
  gulp   = require('gulp'),
  uglify = require('gulp-uglify'),
  jshint = require('gulp-jshint'),
  karma  = require('gulp-karma'),
  rename = require('gulp-rename');

gulp.task('jshint', function () {
  return gulp.src(['dz.input-time.js', 'dz.input-time.spec.js'])
    .pipe(jshint( '.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function () {
  return gulp.src([
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'dz.input-time.js',
    'dz.input-time.spec.js'
  ])
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
})

gulp.task('build', ['jshint', 'test'], function () {
  return gulp.src('dz.input-time.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./'));
});