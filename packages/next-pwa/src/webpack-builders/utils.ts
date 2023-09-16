import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveSwc, terserMinify } from "@ducanh2912/utils";
import type { Config as SwcConfig } from "@swc/core";
import type { MinimizerOptions, TerserOptions } from "terser-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import type { Configuration } from "webpack";

import { assertValue } from "../utils.js";
import { defaultSwcRc } from "./.swcrc.js";
import { NextPWAContext } from "./context.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const resolveTerserOptions = (): MinimizerOptions<TerserOptions> & {
  resolveSwc: typeof resolveSwc;
  useSwcMinify: boolean | undefined;
} => ({
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
    ascii_only: true,
  },
  resolveSwc,
  useSwcMinify: NextPWAContext.useSwcMinify,
});

interface SharedWebpackConfigOptions {
  swcRc?: SwcConfig;
}

export const getSharedWebpackConfig = ({
  swcRc = defaultSwcRc,
}: SharedWebpackConfigOptions): Configuration => {
  const optimization = NextPWAContext.shouldMinify && {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: terserMinify,
        terserOptions: resolveTerserOptions(),
      }),
    ],
  };
  assertValue(
    NextPWAContext.browserslist !== undefined,
    "Browserslist config is not defined. This is most likely a bug."
  );
  if (!swcRc.env) {
    swcRc.env = {};
  }
  swcRc.env.targets = NextPWAContext.browserslist;
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
