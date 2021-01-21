const {src, dest, series, watch} = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const csso = require("gulp-csso");
const include = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const del = require("del");
const sync = require("browser-sync").create();

// Clean

function clean() {
  return del("build")
}

exports.clean = clean;

// Copy artifacts

const copy = () => {
  return src(["source/fonts/**.{woff,woff2}", "source/img/**", "source/js/**", "source/**.html"], {base: "source"})
    .pipe(dest("build"));
};

exports.copy = copy;

// Copy html

const html = () => {
  return src("source/**.html")
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  .pipe(dest("build"))
};

// Webp

const webpImages = () => {
  return src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(dest("source/img"));
};

exports.webpImages = webpImages;

// Sprite

const sprite = () => {
  return src("source/img/icon-*.svg")
  .pipe(svgstore())
  .pipe(rename("sprite.svg"))
  .pipe(dest("build/img"));
};

exports.sprite = sprite;

// CSS
// Styles

const styles = () => {
  return src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(
      sass({
        includePaths: ["node_modules"],
      })
    )
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(dest("build/css"))
    .pipe(sync.stream());
};

// Watcher

const serve = () => {
  sync.init({
    server: "./build"
  })

  watch("source/**.html", series(html)).on("change", sync.reload);
  watch("source/sass/**/**.scss", series(styles)).on("change", sync.reload);
}

exports.build = series(clean, copy, html, webpImages, sprite, styles)
exports.serve = series(clean, copy, html, webpImages, sprite, styles, serve)