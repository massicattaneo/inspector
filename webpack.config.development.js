const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version } = require('./package');

module.exports = {
    entry: {
        'inspector': './src/inspector.js'
    },
    devtool: "source-map",
    mode: 'development',
    resolveLoader: {
        modules: ['node_modules']
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 9002,
        host: '0.0.0.0',
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.inspector.css$/i,
                use: 'raw-loader'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        modules: ['node_modules']
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './src/assets', to: `${version}/assets` },
            { from: './node_modules/vis-timeline/dist/vis-timeline-graph2d.min.js', to: `${version}/assets/js/vis-timeline-graph2d.min.js` },
            { from: './node_modules/vis-timeline/dist/vis-timeline-graph2d.min.css', to: `${version}/assets/js/vis-timeline-graph2d.min.css` },
            { from: './node_modules/jsoneditor/dist/jsoneditor.min.js', to: `${version}/assets/js/jsoneditor.min.js` },
            { from: './node_modules/jsoneditor/dist/jsoneditor.min.css', to: `${version}/assets/js/jsoneditor.min.css` },
            { from: './node_modules/jsoneditor/dist/img/jsoneditor-icons.svg', to: `${version}/assets/js/img/jsoneditor-icons.svg` },
            { from: './node_modules/codemirror/lib/codemirror.js', to: `${version}/assets/js/codemirror.js` },
            { from: './node_modules/codemirror/lib/codemirror.css', to: `${version}/assets/js/codemirror.css` }
        ]),
        new HtmlWebpackPlugin({
            title: 'Development',
            template: './src/index.html',
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            template: './src/receiver.html',
            filename: 'receiver.html',
            inject: false
        }),
        new webpack.DefinePlugin({
            'process.env.PRODUCT_VERSION': JSON.stringify(version),
            'process.env.DEPLOY_PATHNAME': JSON.stringify('http://localhost:9002')
        })
    ]
};
