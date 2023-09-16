import fs from "node:fs";
import path from "node:path";

import {
  addPathAliasesToSWC,
  findFirstTruthy,
  logger,
} from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import type { TsConfigJson as TSConfigJSON } from "type-fest";
import type { Configuration } from "webpack";
import webpack from "webpack";

import { getContentHash } from "../utils.js";
import { defaultSwcRc } from "./.swcrc.js";
import { NextPWAContext } from "./context.js";
import { getSharedWebpackConfig } from "./utils.js";

export const buildCustomWorker = ({
  isDev,
  baseDir,
  customWorkerSrc,
  customWorkerDest,
  customWorkerPrefix,
  plugins = [],
  tsconfig,
  basePath,
}: {
  isDev: boolean;
  swDest: string;
  baseDir: string;
  customWorkerSrc: string;
  customWorkerDest: string;
  customWorkerPrefix: string;
  plugins: Configuration["plugins"];
  tsconfig: TSConfigJSON | undefined;
  basePath: string;
}) => {
  const customWorkerEntry = findFirstTruthy(
    [customWorkerSrc, path.join("src", customWorkerSrc)],
    (dir) => {
      dir = path.join(baseDir, dir);

      const customWorkerEntries = ["ts", "js"]
        .map((ext) => path.join(dir, `index.${ext}`))
        .filter((entry) => fs.existsSync(entry));

      if (customWorkerEntries.length === 0) {
        return undefined;
      }

      const customWorkerEntry = customWorkerEntries[0];

      if (customWorkerEntries.length > 1) {
        logger.info(
          `More than one custom worker found, ${customWorkerEntry} will be used.`
        );
      }

      return customWorkerEntry;
    }
  );

  if (!customWorkerEntry) {
    return undefined;
  }

  logger.event(`Found a custom worker implementation at ${customWorkerEntry}.`);

  const swcRc = defaultSwcRc;

  if (tsconfig && tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
    addPathAliasesToSWC(
      swcRc,
      path.join(baseDir, tsconfig.compilerOptions.baseUrl ?? "."),
      tsconfig.compilerOptions.paths
    );
  }

  const name = `${customWorkerPrefix}-${getContentHash(
    customWorkerEntry,
    isDev
  )}.js`;

  logger.event(
    `Building custom worker to ${path.join(customWorkerDest, name)}...`
  );

  webpack({
    ...getSharedWebpackConfig({
      swcRc,
    }),
    mode: NextPWAContext.shouldMinify ? "production" : "development",
    target: "webworker",
    entry: {
      main: customWorkerEntry,
    },
    output: {
      path: customWorkerDest,
      filename: name,
      chunkFilename: "sw-chunks/[id]-[chunkhash].js",
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(customWorkerDest, `${customWorkerPrefix}-*.js`),
          path.join(customWorkerDest, `${customWorkerPrefix}-*.js.map`),
        ],
      }),
      ...plugins,
    ],
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error("Failed to build custom worker.");
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return path.posix.join(basePath, name);
};
