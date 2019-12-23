const path = require('path');

module.exports = {
    // watch: true,
    mode: "development",
    entry: [
        './static/js/main.ts'
    ],
    output: {
        path: path.join(__dirname, 'static/_js'),
        filename: 'bundle.js'
    },
    // devtool: ['source-map', "#inline-source-map"],
    devtool: "#inline-source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.csv$/,
                loader: 'url-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            }
        ]
    },
    performance: { hints: false }
};