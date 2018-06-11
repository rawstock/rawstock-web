const config = require('config');
const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const IS_PROD = !config.isDebug;

module.exports = {
  isProd: IS_PROD,
  publicPath: config.app.publicPath,
  baseConfig: {
    context: __dirname,
    resolve: {
      modules: ['node_modules'],
      alias: {
        '@client': path.join(__dirname, 'client'),
        '@h5': path.join(__dirname, 'client/views/H5'),
        '@utils': path.join(__dirname, 'client/utils'),
      },
      extensions: ['.ts', '.tsx', '.js'],
    },
    resolveLoader: {
      modules: ['node_modules', path.join(__dirname, 'lib', 'loaders')],
    },
  },
  configs: [
    {
      name: 'h5',
      src: 'client',
      dest: 'static',
      entryCb(name, entry) {
        if (IS_PROD) return entry;
        return ['react-hot-loader/patch'].concat(entry);
      },
      libEntry: './libs/common',
      entryRules: ['views/*/index.ts?(x)'],
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'entry-loader',
                options: {
                  entry: [/views\/(?:[^/]+\/)?index.tsx?($|\?)/],
                },
              },
              IS_PROD ? void 0 : 'react-hot-loader/webpack',
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                  compilerOptions: {
                    target: 'es5',
                  },
                },
              },
            ].filter(Boolean),
            exclude: /node_modules/,
          },
        ],
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          tslint: true,
        }),
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /zh-cn|en/),
      ],
    },
  ],
  libConfig: {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  target: 'es5',
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
      new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /zh-cn|en/),
    ],
  },
};
