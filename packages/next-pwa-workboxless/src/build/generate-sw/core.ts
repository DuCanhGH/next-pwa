import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";
import TerserPlugin from "terser-webpack-plugin";
import type { Configuration, default as Webpack } from "webpack";

import swcRc from "../../.swcrc.json";
import * as logger from "../../logger.js";
import type { FallbackRoutes, RuntimeCaching } from "../../types.js";
import { getFallbackEnvs } from "./core-utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);

export type ImportScripts = string[] | undefined;

export interface GenerateSWConfig {
  id: string;
  baseDir: string;
  destDir: string;
  fallbackRoutes: FallbackRoutes;
  importScripts?: ImportScripts;
  isAppDirEnabled: boolean;
  mode?: Configuration["mode"];
  minify?: boolean;
  pageExtensions: NonNullable<NextConfig["pageExtensions"]>;
  skipWaiting: boolean;
  runtimeCaching: RuntimeCaching[];
}

export const generateSW = ({
  webpackInstance: webpack,
  baseDir,
  destDir,
  fallbackRoutes,
  id,
  importScripts,
  isAppDirEnabled,
  mode,
  minify,
  pageExtensions,
  skipWaiting,
}: GenerateSWConfig & {
  webpackInstance?: typeof Webpack;
}) => {
  const envs = getFallbackEnvs({
    fallbackRoutes,
    baseDir,
    id,
    pageExtensions,
    isAppDirEnabled,
  });

  if (!webpack) {
    logger.error("Webpack instance is not provided to generateSW.");
    return;
  }

  const name = "sw.js";
  const swJs = path.join(__dirname, "build/generate-sw/base-sw.ts");

  webpack({
    mode,
    target: "webworker",
    entry: {
      main: swJs,
    },
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
        "swc-loader": require.resolve("swc-loader"),
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
    output: {
      path: destDir,
      filename: name,
    },
    plugins: [
      new webpack.DefinePlugin({
        __PWA_IMPORT_SCRIPTS__: JSON.stringify(importScripts),
        __PWA_SKIP_WAITING__: skipWaiting.toString(),
      }),
      new webpack.EnvironmentPlugin(envs),
    ],
    optimization: minify
      ? {
          minimize: true,
          minimizer: [new TerserPlugin()],
        }
      : undefined,
  }).run((err, status) => {
    if (err || status?.hasErrors()) {
      logger.error("Failed to build service worker.");
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });
};
