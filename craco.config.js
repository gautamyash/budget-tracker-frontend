// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert/"),
        util: require.resolve("util/"),
        url: require.resolve("url/")
      };
      return webpackConfig;
    },
  },
};
