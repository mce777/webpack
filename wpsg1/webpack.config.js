const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'bundle.js',
		publicPath: 'build/'
	},
	module: {
		rules: [
			{
				use: 'babel-loader',
				// regex to make sure babel only gets applied to js files
				test: /\.js$/
			},
			{
				// use: ['style-loader', 'css-loader'], <--here, css goes into bundle.js
				loader: ExtractTextPlugin.extract({
					loader: 'css-loader'
				}),
				test: /\.css$/
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/,
				use: [
					// 'url-loader',
					// makin it an object so we can pass in options
					{
						loader: 'url-loader',
						options: { limit: 40000 }
					},
					'image-webpack-loader'
				]
			}
		]
	},
	plugins: [
		new ExtractTextPlugin('style.css')
	]
};

module.exports = config;