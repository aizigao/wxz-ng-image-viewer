var path          = require('path');
var del           = require('del');
var series        = require('stream-series');
var gulp          = require('gulp');
var rename        = require('gulp-rename');
var concat        = require('gulp-concat');
var webserver     = require('gulp-webserver');
var templateCache = require('gulp-angular-templatecache');
var minifyCss     = require('gulp-minify-css');
var minifyHtml    = require('gulp-minify-html');
var uglify        = require('gulp-uglify');
var KarmaServer   = require('karma').Server;
var less          = require('gulp-less');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix    = new LessAutoprefix({ browsers: ['last 4 versions',"android >= 4", "ie >= 8"] });


var paths = {
    root:     __dirname,
    src:      path.join(__dirname, '/src'),
    dist:     path.join(__dirname, '/dist')
};

gulp.task('webserver', function() {
    return gulp.src(paths.root)
        .pipe(webserver({
            host: 'localhost',
            port: 3000,
            fallback: 'index.html',
            path:'/',
            livereload: true,
            open: 'http://localhost:3000/docs'
        }));
});

gulp.task('clean', function() {
    del.sync(paths.dist);
});

gulp.task('compileStyles', function() {
    return gulp.src(path.join(paths.src, 'style.less'))
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(concat('wxz-ng-image-viewer.css'))
        .pipe(gulp.dest(paths.dist))
        .pipe(minifyCss())
        .pipe(rename('wxz-ng-image-viewer.min.css'))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('compileScripts', function() {
    var templateStream = gulp.src(path.join(paths.src, 'template.html'))
        .pipe(minifyHtml())
        .pipe(templateCache({
            module: 'wxz-ng-image-viewer',
            root: '../src/'
        }));

    var scriptStream = gulp.src([
        path.join(paths.src, 'wxz-ng-image-viewer.js'),
    ]);

    scriptStream
        .pipe(concat('wxz-ng-image-viewer.js'))
        .pipe(gulp.dest(paths.dist))
        .pipe(uglify())
        .pipe(rename('wxz-ng-image-viewer.min.js'))
        .pipe(gulp.dest(paths.dist));

    series(scriptStream, templateStream)
        .pipe(concat('wxz-ng-image-viewer-tpls.js'))
        .pipe(gulp.dest(paths.dist))
        .pipe(uglify())
        .pipe(rename('wxz-ng-image-viewer-tpls.min.js'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function() {
    gulp.watch(path.join(paths.src, '**/*.less'), ['compileStyles']);
});

gulp.task('test', function(done) {
    new KarmaServer({
        configFile: path.join(paths.root, 'karma.conf.js')
    }, done).start();
});

gulp.task('build', ['clean', 'compileScripts', 'compileStyles']);
gulp.task('default', ['webserver', 'watch']);

