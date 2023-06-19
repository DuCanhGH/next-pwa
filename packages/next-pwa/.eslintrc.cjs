// @ts-check
/** @type {import("eslint").Linter.BaseConfig} */
module.exports = {
  extends: ["plugin:jsdoc/recommended"],
  plugins: ["jsdoc"],
  rules: {
    "jsdoc/require-param-type": "off",
  },
};
