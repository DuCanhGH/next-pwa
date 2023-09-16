import type { Options } from "@swc/core";

export const defaultSwcRc: Options = {
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
    loose: false,
  },
  minify: false,
};
