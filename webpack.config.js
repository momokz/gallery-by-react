var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: __dirname + '/scripts/main.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    devServer: {
        inline: true,
        colors: true,
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: __dirname + '/index.html'
        })
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['es2015', 'react']
            }
        }, {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/,
            loader: 'url?limit=8192&name=[path][hash].[ext]'
        }, {
            test: /\.html$/,
            loader: 'html'
        }, {
            test: /\.css$/,
            loader: 'style!css!postcss'
        }]
    },
    postcss: [require('autoprefixer')],
    resolve: {
        extensions: ['', '.js', '.json']
    }
};