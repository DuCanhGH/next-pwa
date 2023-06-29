import path from "node:path";
import { fileURLToPath } from "node:url";

import TerserPlugin from "terser-webpack-plugin";
import type { Configuration } from "webpack";

import defaultSwcRc from "../.swcrc.json";
import { TERSER_OPTIONS } from "./constants.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const getSharedWebpackConfig = ({
  shouldMinify = true,
  swcRc = defaultSwcRc,
}: {
  shouldMinify?: boolean;
  swcRc?: Record<string, any>;
}): Configuration => {
  const optimization = shouldMinify && {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: TERSER_OPTIONS,
      }),
    ],
  };
  return {
    resolve: {
      extensions: [".js", ".ts"],
      fallback: {
        module: false,
        dgram: false,
        dns: false,
        path: false,
        fs: false,
        os: false,
        crypto: false,
        stream: false,
        http2: false,
        net: false,
        tls: false,
        zlib: false,
        child_process: false,
      },
    },
    resolveLoader: {
      alias: {
        "swc-loader": path.join(__dirname, "swc-loader.cjs"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(t|j)s$/i,
          use: [
            {
              loader: "swc-loader",
              options: swcRc,
            },
          ],
        },
      ],
    },
    optimization: optimization || undefined,
  };
};

/**
 * Safely converts anything to boolean
 * @param value The value
 * @param strict Should the conversion be strict
 * @returns The converted value
 */
export const convertBoolean = (value: unknown, strict = true) => {
  switch (typeof value) {
    case "boolean":
      return value;
    case "number":
    case "bigint":
      return value > 0;
    case "object":
      return !(value === null);
    case "string":
      if (!strict) {
        if (value === "false" || value === "0") return false;
        return true;
      }
      return value === "true" || value === "1";
    case "function":
    case "symbol":
      return true;
    case "undefined":
      return false;
  }
};
