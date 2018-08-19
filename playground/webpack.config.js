module.exports = {
  mode: 'development',
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + "/js",
    filename: "bundle.js",
    sourcePrefix: "",
    library: 'fcsynthPlayground',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
    ]
  }
};
