module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: __dirname + "/dist",
    filename: "index.js",
    sourcePrefix: "",
    library: 'fcsynth',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
    ]
  }
};
