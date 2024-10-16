const path = require('path');

module.exports = {
  // Other configurations...
  resolve: {
    fallback: {
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "url": require.resolve("url/")
    }
  },
  // Other configurations...
};