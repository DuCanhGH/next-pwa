import fs from "node:fs";
import path from "node:path";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import type { TsConfigJson as TSConfigJSON } from "type-fest";
import { addPathAliasesToSWC, logger } from "utils";
import type { Configuration } from "webpack";
import webpack from "webpack";

import defaultSwcRc from "../.swcrc.json";
import { NextPWAContext } from "./context.js";
import { getSharedWebpackConfig } from "./utils.js";

export const buildCustomWorker = ({
  id,
  baseDir,
  customWorkerDir,
  destDir,
  plugins = [],
  tsconfig,
}: {
  id: string;
  baseDir: string;
  customWorkerDir: string;
  destDir: string;
  plugins: Configuration["plugins"];
  tsconfig: TSConfigJSON | undefined;
}) => {
  let workerDir = "";

  const rootWorkerDir = path.join(baseDir, customWorkerDir);
  const srcWorkerDir = path.join(baseDir, "src", customWorkerDir);

  if (fs.existsSync(rootWorkerDir)) {
    workerDir = rootWorkerDir;
  } else if (fs.existsSync(srcWorkerDir)) {
    workerDir = srcWorkerDir;
  }

  if (!workerDir) {
    return;
  }

  const name = `worker-${id}.js`;
  const customWorkerEntries = ["ts", "js"]
    .map((ext) => path.join(workerDir, `index.${ext}`))
    .filter((entry) => fs.existsSync(entry));

  if (customWorkerEntries.length === 0) {
    return;
  }

  const customWorkerEntry = customWorkerEntries[0];

  if (customWorkerEntries.length > 1) {
    logger.info(
      `More than one custom worker found, ${customWorkerEntry} will be used.`
    );
  }

  logger.info(`Custom worker found: ${customWorkerEntry}`);
  logger.info(`Building custom worker: ${path.join(destDir, name)}...`);

  const swcRc = defaultSwcRc;

  if (tsconfig && tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
    addPathAliasesToSWC(
      swcRc,
      path.join(baseDir, tsconfig.compilerOptions.baseUrl ?? "."),
      tsconfig.compilerOptions.paths
    );
  }

  if (tsconfig && tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
    addPathAliasesToSWC(
      swcRc,
      path.join(baseDir, tsconfig.compilerOptions.baseUrl ?? "."),
      tsconfig.compilerOptions.paths
    );
  }

  webpack({
    ...getSharedWebpackConfig({
      swcRc,
      shouldMinify: NextPWAContext.shouldMinify,
    }),
    mode: NextPWAContext.shouldMinify ? "production" : "development",
    target: "webworker",
    entry: {
      main: customWorkerEntry,
    },
    output: {
      path: destDir,
      filename: name,
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(destDir, "worker-*.js"),
          path.join(destDir, "worker-*.js.map"),
        ],
      }),
      ...plugins,
    ],
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error(`Failed to build custom worker.`);
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return name;
};
