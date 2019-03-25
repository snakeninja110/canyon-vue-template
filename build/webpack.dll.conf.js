const path = require('path')
const config = require('../config')
const webpack = require('webpack')

const env = require('../config/prod.env')

const vendors = [
    "vue/dist/vue.esm.js",
    "vue-router",
    "vuex",
    'vue-unicom',
    'element-ui'
];

module.exports = {
    mode: JSON.parse(env.NODE_ENV),
    entry: {
        vendors: vendors
    },
    output: {
        // dll.js 生成到static目录，打包时候会通过CopyWebpackPlugin复制到dist目录下的static里
        path: path.resolve(__dirname, '../static/js'),
        filename: '[name].dll.js',
        library: '[name]'
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new webpack.DllPlugin({
            context: path.resolve(__dirname, '../manifest'), //__dirname,
            name: "[name]",
            path: path.join(__dirname, '../manifest/manifest.json'),
        })
    ]
}