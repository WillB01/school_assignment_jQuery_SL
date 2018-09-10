const webpack = require('webpack');

module.exports = {
    entry: './scripts/app.js',
    output: { path: __dirname + '/wwwroot/scripts', filename: 'bundle.js', publicPath: 'wwwroot' },
    mode: 'development',
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}