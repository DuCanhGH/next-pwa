import path from "node:path";
import { fileURLToPath } from "node:url";

import { logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";

import type { FallbackRoutes } from "../types.js";
import { NextPWAContext } from "./context.js";
import { getFallbackEnvs } from "./get-fallback-envs.js";
import { getSharedWebpackConfig } from "./utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const buildFallbackWorker = ({
  id,
  fallbacks,
  destDir,
}: {
  id: string;
  fallbacks: FallbackRoutes;
  destDir: string;
}) => {
  const envs = getFallbackEnvs({
    fallbacks,
    id,
  });
  if (!envs) return;

  const name = `fallback-${id}.js`;
  const fallbackJs = path.join(__dirname, `fallback.js`);

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

  return { name, precaches: Object.values(envs).filter((v) => !!v) };
};
