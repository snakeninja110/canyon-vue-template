const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const env = require('../config/prod.env')

const vendors = [
    "vue/dist/vue.esm.js",
    "vue-router",
    "vuex",
    "vue-unicom",
    "element-ui",
    "element-ui/lib/theme-chalk/index.css"
];

module.exports = {
    mode: JSON.parse(env.NODE_ENV),
    entry: {
        vendors: vendors
    },
    output: {
        // dll.js 生成到static目录，打包时候会通过CopyWebpackPlugin复制到dist目录下的static里
        path: path.resolve(__dirname, '../static'),
        filename: 'js/[name].dll.js',
        library: '[name]'
    },
    module: {
        rules: [
            // This is required
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        // options: {
                        //     // you can specify a publicPath here
                        //     // by default it use publicPath in webpackOptions.output
                        //     publicPath: '../'
                        // }
                    },
                    "css-loader"
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: path.posix.join('/', 'fonts/[name].[ext]')
                }
            }
        ]
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: path.posix.join('/', 'css/[name].dll.css'),
            allChunks: true,
        }),
        new webpack.DllPlugin({
            context: path.resolve(__dirname, '../manifest'), //__dirname,
            name: "[name]",
            path: path.join(__dirname, '../manifest/manifest.json'),
        })
    ]
}