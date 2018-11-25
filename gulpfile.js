const gulp = require('gulp');
const concat = require('gulp-concat');

const PATH_JS = ['./www/js/*.js', './www/js/**/*.js'];

gulp.task('default', ['js:watch']);

gulp.task('js', () => {
  gulp.src(PATH_JS)
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./www/dist/js/'))
});

gulp.task('js:watch', ['js'], () => {
  gulp.watch(PATH_JS, ['js']);
});