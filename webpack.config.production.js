const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const distDirectory = './dist';
const PRODUCT_VERSION = process.env.PRODUCT_VERSION;
const DEPLOY_PATHNAME = '/';

module.exports = {
    entry: {
        'inspector-inline': './src/inspector.js',
        'inspector': './src/inspector.js'
    },
    devtool: 'source-map',
    mode: 'production',
    output: {
        path: path.resolve(distDirectory),
        filename: '[name].js',
        library: 'GSInspector',
        libraryTarget: 'window',
        umdNamedDefine: true
    },
    resolveLoader: {
        modules: ['node_modules']
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
            { from: './src/assets', to: `${PRODUCT_VERSION}/assets` },
            { from: './node_modules/vis-timeline/dist/vis-timeline-graph2d.min.js', to: `${PRODUCT_VERSION}/assets/js/vis-timeline-graph2d.min.js` },
            { from: './node_modules/vis-timeline/dist/vis-timeline-graph2d.min.css', to: `${PRODUCT_VERSION}/assets/js/vis-timeline-graph2d.min.css` },
            { from: './node_modules/jsoneditor/dist/jsoneditor.min.js', to: `${PRODUCT_VERSION}/assets/js/jsoneditor.min.js` },
            { from: './node_modules/jsoneditor/dist/jsoneditor.min.css', to: `${PRODUCT_VERSION}/assets/js/jsoneditor.min.css` },
            { from: './node_modules/jsoneditor/dist/img/jsoneditor-icons.svg', to: `${PRODUCT_VERSION}/assets/js/img/jsoneditor-icons.svg` },
            { from: './node_modules/codemirror/lib/codemirror.js', to: `${PRODUCT_VERSION}/assets/js/codemirror.js` },
            { from: './node_modules/codemirror/lib/codemirror.css', to: `${PRODUCT_VERSION}/assets/js/codemirror.css` }
        ]),
        new HtmlWebpackPlugin({
            template: './src/inspector.html',
            filename: 'inspector.html',
            inject: true,
            chunks: ['inspector-inline']
        }),
        new HtmlWebpackPlugin({
            template: './src/receiver.html',
            filename: 'receiver.html',
            inject: false
        }),
        new webpack.DefinePlugin({
            'process.env.PRODUCT_VERSION': JSON.stringify(PRODUCT_VERSION),
            'process.env.DEPLOY_PATHNAME': JSON.stringify(DEPLOY_PATHNAME)
        }),
        new ScriptExtHtmlWebpackPlugin({
            inline: 'inspector-inline.js'
        })
    ]
};
