const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = merge(require('./webpack.common.js'), {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
		host: '0.0.0.0',
		port: 8081
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],
});
