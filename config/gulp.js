var path = require('path');

var src = {
  path: path.resolve(__dirname, '../www'),
  js: path.resolve(__dirname, '../www/js'),
  css: path.resolve(__dirname, '../www/css'),
  img: path.resolve(__dirname, '../www/img'),
  jshintrc: path.resolve(__dirname, '../.jshintrc'),
  precommit: path.resolve(__dirname, '../.pre-commit'),
  commitmsg: path.resolve(__dirname, '../.commit-msg.js'),
  git: path.resolve(__dirname, '../.git'),
  view: path.resolve(__dirname, '../www/templates/**/*.js'),
  pkg: path.resolve(__dirname, '../package.json'),
  webpack: path.resolve(__dirname, '../static/script/webpack/'),
};

var dist = {
  path: path.resolve(__dirname, '../dist'),
  js: path.resolve(__dirname, '../dist/dist_js'),
  css: path.resolve(__dirname, '../dist/dist_css'),
  img: path.resolve(__dirname, '../dist/img'),
  view: path.resolve(__dirname, '../dist/view'),
  pkg: path.resolve(__dirname, '../'),
  webpack: path.resolve(__dirname, '../dist/script/webpack/'),
};

var config = {
  src: src,
  dist: dist,
};

module.exports = config;
