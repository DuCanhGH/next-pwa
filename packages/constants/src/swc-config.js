// @ts-check
/**
 * @type {import("@swc/core").Config}
 */
export const swcConfig = {
  module: {
    type: "nodenext",
    lazy: true,
    importInterop: "swc",
  },
  jsc: {
    minify: {
      compress: {
        ecma: 5,
        comparisons: false,
        inline: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        ecma: 5,
        safari10: true,
        comments: false,
        asciiOnly: true,
      },
    },
    parser: {
      syntax: "typescript",
      tsx: false,
      dynamicImport: true,
      decorators: false,
    },
    transform: {
      react: undefined,
    },
    target: "esnext",
    loose: false,
  },
};
