import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";

import { getContentHash } from "../utils.js";
import { nextPWAContext } from "./context.js";
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

  // We'd like to use Webpack's `[hash]`, but we can't determine that hash without
  // Promise (Next doesn't allow Promise in webpack(config, context), but even if we
  // use Promise we will block the build until our stuff is done)
  const name = `swe-worker-${getContentHash(swEntryWorkerEntry, isDev)}.js`;

  webpack({
    ...getSharedWebpackConfig({}),
    mode: nextPWAContext.shouldMinify ? "production" : "development",
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
      logger.error(
        status?.toString({ colors: true }) ?? error?.message ?? "Unknown error"
      );
      process.exit(-1);
    }
  });

  return path.posix.join(basePath, name);
};
