var path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: [
    "core-js/stable",
    "regenerator-runtime/runtime",
    path.resolve(__dirname, "src/index.js"),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  target: "browserslist",
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.m?js$/,
        loader: "babel-loader",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules"),
        ],
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  browsers: "last 2 versions, > 5%, ie >= 10",
                },
                modules: false,
                useBuiltIns: "entry",
                debug: false,
                corejs: 3,
              },
            ],
          ],
          plugins: [
            "@babel/plugin-transform-runtime",
            "@babel/plugin-transform-regenerator",
          ],
          sourceType: "unambiguous",
        },
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: "vh3d",
      filename: "index.html",
      template: "index.html",
      minify: true,
      base: process.env.NODE_ENV === "production" ? "/vh3d/" : "",
    }),
    new HtmlWebpackPlugin({
      title: "vh3d",
      filename: "static/ie.html",
      template: "static/ie.html",
      minify: true,
      base: process.env.NODE_ENV === "production" ? "/vh3d/" : "",
    }),
  ],
};
