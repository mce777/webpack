// webpack.config.js

const path = require('path');

const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');

const SRC_PATH = './src';
const DIST_PATH = '../web/sources/S2.IBE.Web/iberes';

// detect if current build is run with --debug argument which is only the case for development builds
const isDevMode = !!process.argv.find(v => v.indexOf('--debug') !== -1);

// configure SVG optimizer that optimizes SVGs before inlining into CSS
// see https://github.com/svg/svgo
const svgoConfig = JSON.stringify({
    plugins: [
        {cleanupIDs: true}
    ]
});

// output development mode for debugging deployment errors
console.log('Webpack development mode is', isDevMode ? 'on' : 'off');

var webpackConfig = {
    entry: {
        'bundle': path.resolve(`${SRC_PATH}/index-ibe`)
    },
    output: {
        filename: path.resolve(`${DIST_PATH}/[name].js`)
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.less', '.css'],
        root: [path.resolve(SRC_PATH)],
        alias: {
            jquery: path.resolve(`${SRC_PATH}/vendor/jquery.js`)
        }
    },
    module: {
        preLoaders: [
            {
                test: /\.ts$/,
                loader: 'tslint'
            }
        ],
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.svg/,
                loaders: ['svg-url-loader', 'svgo-loader?' + svgoConfig]
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader!less-loader')
            },
            {
                test   : /\.css$/,
                loaders: ['style', 'css', 'resolve-url']
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader'
            }
        ]
    },
    plugins: [
        // extract transformed output from less files that are imported in TypeScript files into a separate css bundle
        new ExtractTextPlugin(
            path.resolve(`${DIST_PATH}/[name].css`)
        ),
        // include fetch polyfill in resulting bundle
        new ProvidePlugin({
            'fetch': 'exports?self.fetch!whatwg-fetch'
        }),
        // exclude moment.js sub dependencies (e.g. unused localizations) from resulting bundle
        // all required localizations for this project are to be found in the "utils/localizedMoment.ts" wrapper
        new IgnorePlugin(/(locale)/, /node_modules.+(momentjs)/)
    ],
    postcss: function () {
        return [
            autoprefixer({
                add: true,
                remove: true,
                browsers: ['last 2 versions', 'iOS >= 8']
            })
        ];
    },
    tslint: {
        configuration: require('./tslint.json'),
        emitErrors: true,
        failOnHint: true
    }
};

if (isDevMode) {
    // add webpack configuration properties that are only required for development
    webpackConfig.devtool = 'source-map';
    webpackConfig.plugins.push(require('./build/webpack/webpackLiveReloadPlugin'));
} else {
    // add webpack configuration properties that are only required for production
    webpackConfig.plugins.push(require('./build/webpack/webpackUglifyJsPlugin'));
}

const StyleLintPlugin = require('stylelint-webpack-plugin');

// lint styles only when not running tests
webpackConfig.plugins.push(new StyleLintPlugin({
    configFile: '.stylelintrc',
    files: ['**/*.less'],
    failOnError: false,
    syntax: 'less'
}));

module.exports = webpackConfig;
