import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";
import TerserPlugin from "terser-webpack-plugin";
import { logger } from "utils";
import type { Configuration, default as Webpack } from "webpack";

import swcRc from "../../.swcrc.json";
import type { ManifestEntry } from "../../private-types.js";
import type {
  FallbackRoutes,
  ImportScripts,
  RuntimeCaching,
} from "../../types.js";
import { getFallbackEnvs } from "./core-utils.js";
import { runtimeCachingConverter } from "./runtime-caching-converter.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export interface GenerateSWConfig {
  id: string;
  mode?: Configuration["mode"];
  minify?: boolean;
  baseDir: string;
  destDir: string;
  isAppDirEnabled: boolean;
  pageExtensions: NonNullable<NextConfig["pageExtensions"]>;

  importScripts?: ImportScripts;
  manifestEntries?: ManifestEntry[];
  skipWaiting: boolean;
  runtimeCaching: RuntimeCaching[];

  fallbackRoutes: FallbackRoutes;
}

export const generateSW = ({
  webpackInstance: webpack,
  baseDir,
  destDir,
  fallbackRoutes,
  id,
  importScripts,
  isAppDirEnabled,
  manifestEntries = [],
  mode,
  minify,
  pageExtensions,
  skipWaiting,
  runtimeCaching,
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
  const swJs = path.join(__dirname, "base-sw.js");

  webpack({
    mode,
    target: "webworker",
    entry: {
      main: swJs,
    },
    resolve: {
      extensions: [".js"],
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
    output: {
      path: destDir,
      filename: name,
    },
    plugins: [
      new webpack.DefinePlugin({
        __PWA_IMPORT_SCRIPTS__: JSON.stringify(importScripts),
        __PWA_RUNTIME_CACHING__: runtimeCachingConverter(runtimeCaching),
        __PWA_MANIFEST_ENTRIES__: JSON.stringify(manifestEntries),
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
