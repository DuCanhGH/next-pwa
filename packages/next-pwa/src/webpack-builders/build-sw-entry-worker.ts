import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";

import { getFilename } from "../utils.js";
import { NextPWAContext } from "./context.js";
import { getSharedWebpackConfig } from "./utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const buildSWEntryWorker = ({
  isDev,
  destDir,
  shouldGenSWEWorker,
  basePath,
}: {
  isDev: boolean;
  destDir: string;
  shouldGenSWEWorker: boolean;
  basePath: string;
}) => {
  if (!shouldGenSWEWorker) {
    return undefined;
  }

  const swEntryWorkerEntry = path.join(__dirname, `sw-entry-worker.js`);

  const name = `swe-worker-${getFilename(swEntryWorkerEntry, isDev)}.js`;

  webpack({
    ...getSharedWebpackConfig({}),
    mode: NextPWAContext.shouldMinify ? "production" : "development",
    target: "webworker",
    entry: {
      main: swEntryWorkerEntry,
    },
    output: {
      path: destDir,
      filename: name,
      chunkFilename: "sw-chunks/[id]-[chunkhash].js",
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(destDir, "swe-worker-*.js"),
          path.join(destDir, "swe-worker-*.js.map"),
        ],
      }),
    ],
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error("Failed to build the service worker's sub-worker.");
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return path.posix.join(basePath, name);
};
