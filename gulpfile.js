#!/usr/local/bin/node

var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var beautify = require('gulp-beautify');
var minify = require('gulp-minify');
//var pump = require('pump');
var jshint = require('gulp-jshint');
//var minifier = require('gulp-uglify/minifier');
var replace = require('gulp-replace');
// var cordova = require('gulp-cordova-builder');
var create = require('gulp-cordova-create');
var plugin = require('gulp-cordova-plugin');
var android = require('gulp-cordova-build-android');
var requireDir = require('require-dir');
var argv = require('yargs').argv;
var gulpNgConfig = require('gulp-ng-config');

var paths = {
  sass: ['./scss/**/*.scss'],
  templatecache: ['./app/templates/**/*.html'],
  ng_annotate: ['./app/js/*.js'],
  useref: ['./app/*.html']
};
//默认的 gulp 处理
gulp.task('default', ['templatecache', 'sass', 'ng_annotate', 'configEnvPro'], function(done) {
  console.log('combine file then uglify');
  sh.rm('-rf', './www/*');
  var options = {
    preserveComments: 'license'
  };
  gulp.src('./app/*.html')
    //.pipe(jshint())
    //在文件合并前将 模板文件(template.js) 开启, 要把模板文件一起合并
    .pipe(gulpif('index.html', replace('<!--script src="js/templates.js"></script-->', '<script src="js/templates.js"></script>')))
    //合并文件
    .pipe(useref())
    //控制层的注入
    .pipe(gulpif('*/app.js', ngAnnotate({ single_quotes: true })))
    .pipe(gulpif('*/app.js', beautify({ indent_size: 2 })))
    //.pipe(gulpif('*/app.js', minify({ext:{min:'.js'}})))//{ext:{min:'.js'},compress:false}
    //混淆文件
    .pipe(gulpif('*/app.js', uglify()))
    // .pipe(gulpif('*/styles.css', minifyCss({
    //   keepSpecialComments: 0
    // })))
    .pipe(gulp.dest('./www'))
    .on('end', done)
    .on('finish', rename);
  //rename the file while file was created;
  function rename() {
    //生成随机名称
    var randStr = randomString(10);
    //将合并好css的文件改名
    sh.mv('./www/dist_css/styles.css', './www/dist_css/styles_' + randStr + '.css');
    //替换 index.html 中的引用到的文件名
    sh.sed('-i', 'styles.css', 'styles_' + randStr + '.css', './www/index.html');
    // 增加 load.js 处理
    sh.sed('-i', '<script src="dist_js/app.js"></script>', '<script src="dist_js/load.js?rand='+(new Date()).getTime()+'" id="asyncLoading" data-asyncLoading="./dist_js/app_'+randStr+'.js"></script>', './www/index.html');

    /* -------------------------新的合并---------------------------------------- */
    //注释掉 mk-require.js
    sh.sed('-i', '<script src="dist_js/sd-require.js"></script>', '<!--script src="dist_js/sd-require.js"></script-->', './www/index.html');
    //将 app.js 再合并到 mk-require.js 中
    sh.cat([
      './www/dist_js/app.js'
    ]).toEnd('./www/dist_js/sd-require.js');
    //将合并后的文件改名
    sh.mv('./www/dist_js/sd-require.js', './www/dist_js/app_' + randStr + '.js');
    //替换 index.html 中的文件名
    sh.sed('-i', 'app.js', 'app_' + randStr + '.js', './www/index.html');
    //删除 app.js 文件
    sh.rm('-rf', './www/dist_js/app.js');
    /* ----------------------------------------------------------------- */
    // sh.sed('-i', '\"app\"', '\"www\"', './ionic.config.json');
    //sh.cp('./www/dist_js/app.js','./www/dist_js/app_'+randStr+'.js');
    //将需要用到的文件复制到相应的文件夹下
    sh.cp('-rf', './app/js/load.js', './www/dist_js/');
    //创建目录
    sh.mkdir('-p', './www/lib');
    sh.mkdir('-p', './www/common');
    sh.mkdir('-p', './www/res');
    //复制需要的文件到指定文件夹下
    sh.cp('-rf', './app/common/img', './www/common/');
    //sh.cp('-rf', './app/common/img', './www/');
    sh.cp('-rf', './app/res/ALiIcon', './www/res/');
    sh.cp('-rf', './app/res/ALiIcon/iconfont*', './www/dist_css/');
    sh.cp('-rf', './app/res/fonts/*', './www/dist_css/');
    sh.cp('-rf', './app/res/fonts', './www/');
    sh.cp('-rf', './app/res/lib/slick-carousel/slick/fonts/*', './www/dist_css/fonts/');
    //sh.cp('-rf', './app/lib/ionic-citypicker', './www/lib');
    //sh.cp('-rf', './app/bower_components', './www/');
    //恢复本地环境变量
    createLocalEnv();
  }

  function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }
});

gulp.task('sass', function(done) {
  gulp.src('./app/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.templatecache, ['templatecache']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.ng_annotate, ['ng_annotate']);
  gulp.watch(paths.useref, ['useref']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('templatecache', function(done) {
  //var TEMPLATE_BODY = "$templateCache.put('templates/<%= url %>','<%= contents %>');";
  gulp.src('./app/view/**/*.html')
    .pipe(templateCache({
      standalone: true,
      transformUrl: function(url) {
        url = 'view/' + url;
        return url;
      }
    }))
    .pipe(gulp.dest('./app/js'))
    .on('end', done);
});

gulp.task('ng_annotate', function(done) {
  gulp.src('./app/js/*.js')
    .pipe(ngAnnotate({ single_quotes: true }))
    //.pipe(uglify())
    .pipe(gulp.dest('./www/dist_js/app'))
    .on('end', done);
});

gulp.task('useref', function(done) {
  var options = {
    preserveComments: 'license'
  };
  //replace('<!--script src="js/templates.js"></script-->', '<script src="js/templates.js"></script>')
  gulp.src('./app/*.html')
    .pipe(gulpif('index.html', replace('<!--script src="js/templates.js"></script-->', '<script src="js/templates.js"></script>')))
    //.pipe(jshint())
    .pipe(useref())
    // .pipe(gulpif('*/app.js', beautify({indentSize: 2})))
    // .pipe(gulpif('*/app.js', minify({ext:{min:'.js'}})))//{ext:{min:'.js'},compress:false}
    // .pipe(gulpif('*/styles.css', minifyCss({
    //   keepSpecialComments: 0
    // })))
    .pipe(gulp.dest('./www'))
    .on('end', done);
});

//cordova 打包处理, 先执行 default 后再执行打包
gulp.task('build', ['configEnvPro', 'default'], function() {
  var options = {
    dir: '.cordova',
    id: 'com.lvwei.ionic.shell',
    name: 'ionic-shell'
  };
  //打包的配置
  var config = {
    release: false
  };
  //如果是 production
  if (argv.production) {
    config = {
      release: true
    };
  }

  //先删除所有已经生成的 apk 文件
  sh.find('.').filter(function(file) {
    if (file.match(/.apk$/)) {
      var apkPath = file.match(/\.apk$/);
      if (apkPath) {
        sh.rm('-rf', file);
        console.log('delete apkPath:', file);
      }
    }
    return file.match(/.apk$/);
  });

  return gulp.src('./www')
    // .pipe(create(options))
    // .pipe(plugin('cordova-plugin-dialogs'))
    // .pipe(plugin('org.apache.cordova.camera'))
    .pipe(android(config))
    // .pipe(android())
    .pipe(gulp.dest('apk'))
    .on('finish', revertEnv);

  function revertEnv() {
    //恢复本地环境变量
    createLocalEnv();
    sh.sed('-i', '\"www\"', '\"app\"', './ionic.config.json');
  }
});

//创建本地环境配置信息
function createLocalEnv() {
  console.log("config env reverting");
  //默认是本地配置
  var options = {
    environment: 'env.local'
  };
  gulp.src('configEnv.json')
  .pipe(gulpNgConfig('app.config', options))
  .pipe(gulp.dest('./app/common/js/'));
}

//创建 config 文件, 线上环境配置
gulp.task('configEnvPro', function() {
  //默认是本地配置
  var options = {
    environment: 'env.local'
  };
  //如果是 production
  if (argv.production) {
    options = {
      environment: 'env.production'
    };
    console.log('env: production');

  } else if (argv.testing) {
    //如果是 production
    options = {
      environment: 'env.testing'
    };
    console.log('env: testing');
  } else {
    console.log('env: local');
  }
  gulp.src('configEnv.json')
  .pipe(gulpNgConfig('app.config', options))
  .pipe(gulp.dest('./app/common/js/'));
});

//创建 config 文件, 本地环境配置
gulp.task('configEnvLocal', function() {
  //默认是本地配置
  var options = {
    environment: 'env.local'
  };
  gulp.src('configEnv.json')
  .pipe(gulpNgConfig('app.config', options))
  .pipe(gulp.dest('./app/common/js/'));
});