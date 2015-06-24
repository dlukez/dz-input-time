module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine'],
    plugins: [
      'karma-jasmine',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-mocha-reporter'
    ],
    reporters: 'mocha',
    port: 9018,
    runnerPort: 9100,
    urlRoot: '/',
    autoWatch: false,
    browsers: [
      'PhantomJS'
    ]
  });
};
