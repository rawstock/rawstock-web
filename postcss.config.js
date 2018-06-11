module.exports = {
  plugins: [
    require('precss')({
      parser: require('postcss-scss'),
    }),
    require('autoprefixer')({
      remove: false,
      browsers: ['iOS >= 7', 'android >= 4.4'],
    }),
  ],
};
