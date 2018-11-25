const gulp = require('gulp');
const concat = require('gulp-concat');

//Path para la ubicación de los archivos JS
const PATH_JS = ['./www/js/*.js', './www/js/**/*.js'];

//Task por default
gulp.task('default', ['js:watch']);

//Task para generar el bundle final de los archivos JS
gulp.task('js', () => {
  gulp.src(PATH_JS)
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./www/dist/js/'))
});

//Task para watchear los archivos cuando se modifican y corre la task 'js'
gulp.task('js:watch', ['js'], () => gulp.watch(PATH_JS, ['js']));