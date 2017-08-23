var gulp = require('gulp'),
	path = require('path'),
	fs = require('fs'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	uglify = require('gulp-uglify'),
	header = require('gulp-header'),
	concat = require('gulp-concat'),
	tap = require('gulp-tap'),
	pkg = require('./package.json');

var banner = ['/*!*',
	' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.repository.url %>)',
	' * Created by <%= pkg.author %> on <%= new Date().getFullYear() %>/<%= new Date().getMonth() %>',
	' * Licensed under the <%= pkg.license %> license',
	' */',
	''].join('\n');


gulp.task('style',function (){
	setTimeout(function(){
		gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css'])
			/*.pipe(sourcemaps.init())
			.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
			.pipe(autoprefixer(['iOS >= 7', 'Android >= 4.1']))*/
			.pipe(rename(function (file){
				file.basename = 'style.min';
			}))
			// .pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./dist/assets/style/'))
			// .pipe(browserSync.reload({stream:true}))
	},500);
})

gulp.task('script',function (){
	return gulp.src([
		'./src/**/*.js',
		])
		.pipe(header(banner,{pkg:pkg}))
		.pipe(gulp.dest('./dist'))
		.pipe(uglify({output:{comments:"/^!/"}}).on('error',function (e){
			console.error(e);
		}))
		.pipe(rename(function (path){
			path.basename += '.min';
		}))
		.pipe(gulp.dest('./dist'))
})


gulp.task('serve',function (){
	browserSync.init({
		server: {
		    baseDir: './'
		},
		port: 8080,
		ui: {
		    port: 8080,
		    weinre: {
		        port: 9090
		    }
		}
	})
})

gulp.task('reset',function (){
	gulp.src('./dist/*',{read: false})
		.pipe(clean());
})

gulp.task('release',['script']);

gulp.task('default',function(){
	gulp.start('dev');
})

gulp.task('dev',['release','serve'],function(){
	// gulp.watch('src/sass/**/*',['style']);
	gulp.watch('src/js/*',['script']);
})

gulp.task('prod',['release'])