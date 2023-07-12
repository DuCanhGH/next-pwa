import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";

import { NextPWAContext } from "./context.js";
import { getSharedWebpackConfig } from "./utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const buildSWEntryWorker = ({
  id,
  destDir,
  shouldGenSWEWorker,
}: {
  id: string;
  destDir: string;
  shouldGenSWEWorker: boolean;
}) => {
  if (!shouldGenSWEWorker) {
    return undefined;
  }
  const name = `sw-entry-worker-${id}.js`;
  const swEntryWorkerEntry = path.join(__dirname, `sw-entry-worker.js`);

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
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(destDir, "sw-entry-worker-*.js"),
          path.join(destDir, "sw-entry-worker-*.js.map"),
        ],
      }),
    ],
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error(`Failed to build sw-entry's worker.`);
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return `/${name}`;
};
