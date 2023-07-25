import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";

import type { FallbackRoutes } from "../types.js";
import { getFilename } from "../utils.js";
import { NextPWAContext } from "./context.js";
import { getFallbackEnvs } from "./get-fallback-envs.js";
import { getSharedWebpackConfig } from "./utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const buildFallbackWorker = ({
  isDev,
  buildId,
  fallbacks,
  destDir,
  basePath,
}: {
  isDev: boolean;
  buildId: string;
  fallbacks: FallbackRoutes;
  destDir: string;
  basePath: string;
}) => {
  fallbacks = Object.keys(fallbacks).reduce((obj, key) => {
    const value = fallbacks[key];
    if (value) {
      obj[key] = path.posix.join(basePath, value);
    }
    return obj;
  }, {} as FallbackRoutes);

  const envs = getFallbackEnvs({
    fallbacks,
    buildId,
  });

  if (!envs) {
    return undefined;
  }

  const fallbackJs = path.join(__dirname, `fallback.js`);

  const name = `fallback-${getFilename(fallbackJs, isDev)}.js`;

  webpack({
    ...getSharedWebpackConfig({}),
    mode: NextPWAContext.shouldMinify ? "production" : "development",
    target: "webworker",
    entry: {
      main: fallbackJs,
    },
    output: {
      path: destDir,
      filename: name,
      chunkFilename: "sw-chunks/[id]-[chunkhash].js",
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(destDir, "fallback-*.js"),
          path.join(destDir, "fallback-*.js.map"),
        ],
      }),
      new webpack.EnvironmentPlugin(envs),
    ],
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error("Failed to build fallback worker.");
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return {
    name: path.posix.join(basePath, name),
    precaches: Object.values(envs).filter((v) => !!v),
  };
};
