'use strict'
/* global require */

var gulp = require("gulp");
var path = require('path');
var colors = require("colors");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var watch = require("gulp-watch");
var rename = require("gulp-rename");
var jsoncombine = require("gulp-jsoncombine");
var jsonminify = require("gulp-jsonminify");
var folders = require('gulp-folders');

var paths = {
  js: "./src",
  locales: "./src/locales",
  distJs: "./dist",
  distLocales: "./dist/locales"
};

function mergeProperties(source, dest) {
  for(var key in source) {
    if(typeof(source[key]) == "object") {
      if(typeof(dest[key]) == "undefined") {
        dest[key] = {};
      }

      mergeProperties(source[key], dest[key]);
    }
    else if(typeof(dest[key]) != "undefined") {
      console.log("Property " + key + " is defined more than once");
    }
    else {
      dest[key] = source[key];
    }
  }

  return dest;
}

gulp.task("minify-js", function () {
  gulp.src(paths.js + '/**/*.js') // path to your files
    .pipe(concat('i18n.js'))
    .pipe(gulp.dest(paths.distJs))
    .pipe(rename('i18n.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.distJs));
});

gulp.task("build-locales", folders(paths.locales, function(locale) {
    return gulp.src(path.join(paths.locales, locale, "*.json"))
        .pipe(jsoncombine("translation_" + locale + ".json", function(data) {
          var dict = {};

          for(var file in data) {
            mergeProperties(data[file], dict);
          }

          return new Buffer(JSON.stringify(dict));
        }))
        .pipe(jsonminify())
        .pipe(gulp.dest(paths.distLocales));
}));

gulp.task("build", ["minify-js", "build-locales"], function() {

});

gulp.task("dev", function() {
  // Build locales on start once
  gulp.run("build");

  // Watch locale files for changes
  gulp.watch([paths.locales + "/**/*.json"], ["build"]);
  console.log("[locales] Watching for changes in locale files".yellow.inverse);
});

gulp.task("default", [], function() {
  console.log("***********************".yellow);
  console.log("  gulp dev: watch for changes in locale files".yellow);
  console.log("  gulp build: build a distribution version".yellow);
  console.log("***********************".yellow);
  return true;
});