var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "80";

new WebpackDevServer(webpack(config), {
　　publicPath: config.output.publicPath,
　　hot: true,
　　historyApiFallback: true
}).listen(PORT, HOST, function (err, result) {
　　if (err) {
　　　　return console.log(err);
　　}
　　console.log('Listening at http://localhost:' + PORT + '/');
});