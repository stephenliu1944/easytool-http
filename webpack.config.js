var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var env = process.env.NODE_ENV;

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "80";

var config = {
    entry: [
        // 热部署配置
        'webpack-dev-server/client?http://' + HOST + ':' + PORT,
    　　'webpack/hot/only-dev-server',
        // 入口文件
        './src/index.jsx'
    ],
    output: {
        path: path.join(__dirname, 'build'),
        publicPath: '/build',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            include: path.join(__dirname, 'src'),
            loaders: ['react-hot-loader', 'babel-loader']
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader' 
        }, {
            test: /\.(png|jpg|jpeg)$/, 
            loader: 'url-loader?limit=8192'
        }]
    },
/*    devServer: {
        // contentBase: "./public",
        // do not print bundle build stats
        noInfo: true,
        // enable HMR
        hot: true,
        // embed the webpack-dev-server runtime into the bundle
        inline: true,
        // serve index.html in place of 404 responses to allow HTML5 history
        historyApiFallback: true,
        port: PORT,
        host: HOST
    },*/
    plugins: [
        // new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),         // 出错不终止插件
        new webpack.HotModuleReplacementPlugin(),   // 热部署插件, 不用按F5刷新页面就能看到更新.
        new webpack.DefinePlugin({                  // 配置全局变量
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            __DEV__: true,
            __MOCK__: true
        })
    ]
};

/*if (env === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false,
                screw_ie8: false
            },
            mangle: {
                screw_ie8: false
            },
            output: {
                screw_ie8: false
            }
        })
    )
}*/

module.exports = config;