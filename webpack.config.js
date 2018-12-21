var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: {
		bundle: ['regenerator-runtime/runtime', path.join(__dirname, 'index.js')],
		test: './test/index.js'
	},
	module: {
		loaders: [
			{
				test: /\.(js|jsx)$/,
				//exclude:  /node_modules\/(?!imagecrop\/)/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				loaders: ['style-loader', 'css-loader']
			},
			{
				test: /\.scss$/,
				loaders: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.(png|gif|jpe?g|svg|ttf|woff2?|eot)($|\?)/,
				use: 'file-loader'
			},
			{
				test: /\.html$/,
				use: 'html-loader'
			}
		]
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js',
		publicPath: '/',
		jsonpFunction: 'webpackJsonpCoinKredWidget'
	},
	devServer: {
		contentBase: __dirname,
		historyApiFallback: true,
		host: '0.0.0.0'
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	],
	resolve: {
		modules: [path.join(__dirname, 'public', 'js'), 'node_modules'],
		extensions: ['.js', '.css', '.html'],
		alias: {
			// Preact aliases
			react: 'preact-compat',
			'react-dom': 'preact-compat',
			'create-react-class': 'preact-compat/lib/create-react-class'
		}
	},
	externals: {
		jquery: 'jQuery',
		bootstrap: 'jQuery'
	}
};
