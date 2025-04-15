// rollup.config.js
// import typescript from "@rollup/plugin-typescript";
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const path = require("path");

// import nodePolyfills from 'rollup-plugin-node-polyfills';

const NODE_ENV = process.env.NODE_ENV || "test";
console.log("NODE_ENV", NODE_ENV);

module.exports = {
  input: path.join(__dirname, "./src/index.ts"),

  output: {
    name: "IDBFileSystem",
    file: path.join(__dirname, "./dist/umd/index.js"),
    format: "umd",
  },

  plugins: [
    typescript({
      tsconfig: path.join(__dirname, "./tsconfig.umd.json"),
      declaration: true,
      sourceMap: true,
      useTsconfigDeclarationDir: true,
      importHelpers: false,

    }),
    resolve(),
    commonjs({ extensions: [".js", ".ts"] }),
  ],
};
