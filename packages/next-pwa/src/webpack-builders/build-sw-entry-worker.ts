import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";

import { NextPWAContext } from "./context.js";
import { getSharedWebpackConfig } from "./utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const buildSWEntryWorker = async ({
  destDir,
  shouldGenSWEWorker,
  basePath,
}: {
  destDir: string;
  shouldGenSWEWorker: boolean;
  basePath: string;
}) => {
  if (!shouldGenSWEWorker) {
    return undefined;
  }

  const swEntryWorkerEntry = path.join(__dirname, `sw-entry-worker.js`);

  return new Promise<string | undefined>((resolve) => {
    webpack(
      {
        ...getSharedWebpackConfig({}),
        mode: NextPWAContext.shouldMinify ? "production" : "development",
        target: "webworker",
        entry: {
          main: swEntryWorkerEntry,
        },
        output: {
          path: destDir,
          filename: "swe-worker-[contenthash].js",
          chunkFilename: "pwa-chunks/[id]-[chunkhash].js",
        },
        plugins: [
          new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
              path.join(destDir, "swe-worker-*.js"),
              path.join(destDir, "swe-worker-*.js.map"),
            ],
          }),
        ],
      },
      (error, status) => {
        if (error || status?.hasErrors()) {
          logger.error("Failed to build the service worker's sub-worker.");
          logger.error(status?.toString({ colors: true }));
          process.exit(-1);
        }
        const name = status
          ?.toJson()
          .assetsByChunkName?.main?.find((file) =>
            file.startsWith("swe-worker-")
          );

        if (!name) {
          logger.error("Expected custom worker's name, found none.");
          process.exit(-1);
        }

        resolve(path.posix.join(basePath, name));
      }
    );
  });
};
