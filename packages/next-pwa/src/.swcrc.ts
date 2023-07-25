import type { SwcOptions } from "@ducanh2912/utils";

export const defaultSwcRc: SwcOptions = {
  module: {
    type: "es6",
    lazy: true,
    noInterop: true,
  },
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
      dynamicImport: true,
      decorators: false,
    },
    transform: {
      react: {
        runtime: "automatic",
      },
    },
    target: "es2022",
    loose: false,
  },
  minify: false,
};
