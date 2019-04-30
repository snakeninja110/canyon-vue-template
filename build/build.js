'use strict'
require('./check-versions')()

const version = require('./global').getVersion();

process.env.NODE_ENV = 'production'

const ora = require('ora')
// const rm = require('rimraf')
// const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')
const gitPush = require('./build_stage')

const spinner = ora('building for production...')
spinner.start()

// rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  // if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))

    let callback = function() {
      console.log("\x1B[33m 编译版本号:" + version + "\x1B[0m");
    }
    //  上传git
    let flag = gitPush(version);
    // 上传狮子座
    if (flag) {
      // git 未报错，才上传狮子座(CDN)
      // require("./deploy/index")(callback);
    }
  })
// })
